import { groupBy, mapValues, partition } from 'lodash-es';
import PQueue from 'p-queue';
import { type ApiChain, SupportedChains } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { isResultFulfilled } from '../../../utils/promise.ts';
import { serviceEventBus } from '../../../utils/ServiceEventBus.ts';
import { sleep } from '../../../utils/time.ts';
import { isEnsoCircuitOpenedSince } from '../api/enso/index.ts';
import { type ChainProvider, DataLayer } from './DataLayer.ts';
import { fetchProviderSupportForChainTokens, getProvidersForChain } from './fetch.ts';
import type { ProviderId } from './providers/index.ts';
import { getLastSupportedUpdate, isUpdateDue } from './throttle.ts';
import type { ProviderSupportByChainByAddress } from './types.ts';

const logger = getLoggerFor({ module: 'zap' });

const MIN_UPDATE_DELAY = 2 * 60 * 60 * 1000; // 2 hours; actual update runs after next price update
/** Per provider minimum time between updates; must stay below DATA_DELETE_AFTER */
const MIN_PROVIDER_UPDATE_DELAY: Partial<Record<ProviderId, number>> = {
  enso: 6 * 60 * 60 * 1000, // 6 hours; every call costs api credits
};
const DATA_DELETE_AFTER = 12 * 60 * 60 * 1000; // 12 hours; delete provider token support +/- DATA_GC_INTERVAL
const DATA_GC_INTERVAL = 60 * 60 * 1000; // 1 hour; garbage collect provider token support every hour
const CACHE_KEY_ROOT = 'zap/swaps';
const SWAP_TEST_AMOUNT = 1000; // Test swaps with $1000 in native
const MAX_PRICE_IMPACT = 0.1; // Allow for 10% price impact + fees for zap swaps before disabling that token

const dataLayer = new DataLayer(CACHE_KEY_ROOT, DATA_DELETE_AFTER, DATA_GC_INTERVAL);
const lastUpdateStartedAt = new Map<string, number>();

async function updateChainProvider(apiChain: ApiChain, providerId: ProviderId) {
  const start = Date.now();
  logger.debug({ chain: apiChain, component: providerId }, 'chain provider update started');

  const supportByAddress = await fetchProviderSupportForChainTokens(
    providerId,
    apiChain,
    MAX_PRICE_IMPACT,
    SWAP_TEST_AMOUNT
  );

  // Quotes refused by an open breaker say nothing about support, so keep the previous data and retry next cycle
  if (providerId === 'enso' && isEnsoCircuitOpenedSince(start)) {
    throw new Error('enso circuit breaker opened during update');
  }

  // A crawl with no supported tokens is likely an API outage, so keep the last good data and retry next cycle
  const hasSupported = Object.values(supportByAddress).some(support => support.supported);
  if (!hasSupported && getLastSupportedUpdate(dataLayer.get(apiChain, providerId)) !== undefined) {
    throw new Error(`${providerId} found no supported tokens on ${apiChain}, keeping previous data`);
  }

  // Save to locally and cache to redis
  await dataLayer.set(apiChain, providerId, supportByAddress);
  if (hasSupported) {
    lastUpdateStartedAt.set(`${apiChain}:${providerId}`, start);
  }

  logger.debug(
    { chain: apiChain, component: providerId, durationMs: Date.now() - start },
    'chain provider update completed'
  );
}

function getChainProviders() {
  return SupportedChains.reduce((acc, apiChain) => {
    const providers = getProvidersForChain(apiChain);
    providers.forEach(providerId => acc.push({ apiChain, providerId }));
    return acc;
  }, [] as ChainProvider[]);
}

function isChainProviderUpdateDue({ apiChain, providerId }: ChainProvider, now: number) {
  return isUpdateDue(lastUpdateStartedAt.get(`${apiChain}:${providerId}`), MIN_PROVIDER_UPDATE_DELAY[providerId], now);
}

async function performUpdate() {
  logger.info('swap service update started');
  try {
    const start = Date.now();
    const updates = getChainProviders().filter(chainProvider => isChainProviderUpdateDue(chainProvider, start));

    // Run updates in parallel per provider
    const queue = mapValues(groupBy(updates, 'providerId'), () => new PQueue({ concurrency: 1, autoStart: true }));
    const results = await Promise.allSettled(
      updates.map(({ apiChain, providerId }) => queue[providerId].add(() => updateChainProvider(apiChain, providerId)))
    );

    const [fulfilled, rejected] = partition(results, isResultFulfilled);

    logger.info(
      { durationMs: Date.now() - start, successes: fulfilled.length, failures: rejected.length },
      'swap service update completed'
    );
    if (rejected.length) {
      rejected.forEach(({ reason }) => logger.warn({ err: reason }, 'chain provider update failed'));
    }
  } catch (err) {
    logger.error({ err }, 'swap service update failed');
  } finally {
    scheduleUpdate();
  }
}

function scheduleUpdate() {
  waitForNewData()
    .then(performUpdate)
    .catch(err => {
      logger.warn({ err }, 'waitForNewData failed');
      scheduleUpdate();
    });
}

async function waitForNewData() {
  // Wait at least this long
  await sleep(MIN_UPDATE_DELAY);
  // Then run on the first prices update after vaults are updated (adds 0-10 minute delay to above)
  // This ensures prices are most accurate which is needed as we use prices to determine if a token is supported
  await serviceEventBus.waitForNextEvent('vaults/updated');
  await serviceEventBus.waitForNextEvent('prices/updated');
}

async function waitForInitialDependencies() {
  return Promise.all([
    serviceEventBus.waitForFirstEvent('vaults/updated'),
    serviceEventBus.waitForFirstEvent('boosts/updated'),
    serviceEventBus.waitForFirstEvent('tokens/updated'),
    serviceEventBus.waitForFirstEvent('prices/updated'),
  ]);
}

export async function initZapSwapService() {
  // Load from cache
  await loadFromCache();
  // Wait for all data to be ready
  await waitForInitialDependencies();
  // Update now
  await performUpdate();
}

async function loadFromCache() {
  const chainProviders = getChainProviders();
  await dataLayer.loadFromCache(chainProviders);
  // So a restart doesn't re-crawl providers whose cached data is still fresh
  for (const { apiChain, providerId } of chainProviders) {
    const lastUpdate = getLastSupportedUpdate(dataLayer.get(apiChain, providerId));
    if (lastUpdate !== undefined) {
      lastUpdateStartedAt.set(`${apiChain}:${providerId}`, lastUpdate);
    }
  }
}

export function getTokenSwapSupport(): ProviderSupportByChainByAddress {
  return dataLayer.getProviderSupport();
}

export function getDebugTokenSwapSupport() {
  return dataLayer.getTokenSupport();
}
