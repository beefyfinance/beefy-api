import { groupBy, pick } from 'lodash-es';
import { getKey, setKey } from '../../../utils/cache/index.ts';
import { type ApiChain, isApiChain } from '../../../utils/chain.ts';
import { envNumber } from '../../../utils/env.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { contextAllSettled, isContextResultFulfilled, isContextResultRejected } from '../../../utils/promise.ts';
import { serviceEventBus } from '../../../utils/ServiceEventBus.ts';
import { getVaultsByType } from '../../stats/getMultichainVaults.ts';
import { fetchChainSwapFees } from './fetch.ts';
import type { ClmSwapFees } from './types.ts';

const logger = getLoggerFor({ module: 'clm', component: 'swap-fees' });

const CACHE_KEY = 'COW_SWAP_FEES';
const INIT_DELAY = envNumber('COW_SWAP_FEES_INIT_DELAY', 5000);
const REFRESH_INTERVAL = 15 * 60 * 1000;

let feesByChain: Partial<Record<ApiChain, ClmSwapFees>> = {};
let allFees: ClmSwapFees = {};

/** Swap fee of each CLM's pool, keyed by CLM id; undefined until the first load */
export function getCowSwapFees(): ClmSwapFees | undefined {
  return Object.keys(allFees).length ? allFees : undefined;
}

async function updateAll() {
  const start = Date.now();
  const vaultsByChain = groupBy(getVaultsByType('cowcentrated'), vault => vault.chain);
  const chains = Object.keys(vaultsByChain).filter(isApiChain);
  const results = await contextAllSettled(chains, chain => fetchChainSwapFees(chain, vaultsByChain[chain]));

  // a vault whose read failed keeps its last known fee, removed vaults are dropped
  for (const result of results.filter(isContextResultFulfilled)) {
    const merged = { ...feesByChain[result.context], ...result.value };
    feesByChain[result.context] = pick(
      merged,
      vaultsByChain[result.context].map(vault => vault.id)
    );
  }
  allFees = Object.assign({}, ...Object.values(feesByChain));
  await setKey(CACHE_KEY, feesByChain);

  const rejected = results.filter(isContextResultRejected);
  rejected.forEach(result => logger.warn({ chain: result.context, err: result.reason }, 'chain update failed'));
  logger.info(
    { count: Object.keys(allFees).length, failedChains: rejected.length, durationMs: Date.now() - start },
    'cow swap fees updated'
  );
}

function scheduleUpdate(delay: number) {
  setTimeout(() => {
    updateAll()
      .catch(err => logger.error({ err }, 'update failed'))
      .finally(() => scheduleUpdate(REFRESH_INTERVAL));
  }, delay);
}

export async function initCowSwapFeesService() {
  const cached = await getKey<Partial<Record<ApiChain, ClmSwapFees>>>(CACHE_KEY);
  if (cached) {
    feesByChain = cached;
    allFees = Object.assign({}, ...Object.values(feesByChain));
  }
  await serviceEventBus.waitForFirstEvent('vaults/updated');
  scheduleUpdate(INIT_DELAY);
}
