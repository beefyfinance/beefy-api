import { serviceEventBus } from '../../../utils/ServiceEventBus';
import { ApiChain, SupportedChains } from '../../../utils/chain';
import { groupBy, mapValues, partition } from 'lodash';
import { isResultFulfilled } from '../../../utils/promise';
import { sleep } from '../../../utils/time';
import { ProviderSupportByChainByAddress } from './types';
import { fetchProviderSupportForChainTokens, getProvidersForChain } from './fetch';
import { ProviderId } from './providers';
import { ChainProvider, DataLayer } from './DataLayer';
import PQueue from 'p-queue';
import { getLoggerFor } from '../../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'zap' });

const MIN_UPDATE_DELAY = 2 * 60 * 60 * 1000; // 2 hours; actual update runs after next price update
const DATA_DELETE_AFTER = 12 * 60 * 60 * 1000; // 12 hours; delete provider token support +/- DATA_GC_INTERVAL
const DATA_GC_INTERVAL = 60 * 60 * 1000; // 1 hour; garbage collect provider token support every hour
const CACHE_KEY_ROOT = 'zap/swaps';
const SWAP_TEST_AMOUNT = 1000; // Test swaps with $1000 in native
const MAX_PRICE_IMPACT = 0.1; // Allow for 10% price impact + fees for zap swaps before disabling that token

const dataLayer = new DataLayer(CACHE_KEY_ROOT, DATA_DELETE_AFTER, DATA_GC_INTERVAL);

async function updateChainProvider(apiChain: ApiChain, providerId: ProviderId) {
  const start = Date.now();
  logger.debug({ chain: apiChain, platform: providerId }, 'chain provider update started');

  const supportByAddress = await fetchProviderSupportForChainTokens(
    providerId,
    apiChain,
    MAX_PRICE_IMPACT,
    SWAP_TEST_AMOUNT
  );

  // Save to locally and cache to redis
  await dataLayer.set(apiChain, providerId, supportByAddress);

  logger.debug(
    { chain: apiChain, platform: providerId, durationMs: Date.now() - start },
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

async function performUpdate() {
  logger.info('swap service update started');
  try {
    const start = Date.now();
    const updates = getChainProviders();

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
  await dataLayer.loadFromCache(getChainProviders());
}

export function getTokenSwapSupport(): ProviderSupportByChainByAddress {
  return dataLayer.getProviderSupport();
}

export function getDebugTokenSwapSupport() {
  return dataLayer.getTokenSupport();
}
