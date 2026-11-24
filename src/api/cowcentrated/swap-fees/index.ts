import { groupBy, mapValues, pickBy } from 'lodash-es';
import { getKey, setKey } from '../../../utils/cache/index.ts';
import { isApiChain } from '../../../utils/chain.ts';
import { envNumber } from '../../../utils/env.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import {
  contextAllSettled,
  isContextResultFulfilled,
  isContextResultRejected,
  withTimeout,
} from '../../../utils/promise.ts';
import { serviceEventBus } from '../../../utils/ServiceEventBus.ts';
import { getVaultsByType } from '../../stats/getMultichainVaults.ts';
import { fetchChainSwapFees } from './fetch.ts';
import type { ClmSwapFee, ClmSwapFees } from './types.ts';

const logger = getLoggerFor({ module: 'clm', component: 'swap-fees' });

const CACHE_KEY = 'COW_SWAP_FEES';
export const INIT_DELAY = envNumber('COW_SWAP_FEES_INIT_DELAY', 5000);
export const REFRESH_INTERVAL = 15 * 60 * 1000;
export const CHAIN_TIMEOUT = 5 * 60 * 1000;
/** how long a vault keeps its last fee while its reads fail */
export const MAX_AGE = envNumber('COW_SWAP_FEES_MAX_AGE', 60 * 60 * 1000);

type FeeEntry = { fee: ClmSwapFee; updatedAt: number };
type FeeEntries = Record<string, FeeEntry>;

let entries: FeeEntries = {};
let fees: ClmSwapFees = {};

/** Swap fee of each CLM's pool, keyed by CLM id; undefined until the first load */
export function getCowSwapFees(): ClmSwapFees | undefined {
  return Object.keys(fees).length ? fees : undefined;
}

const isFresh = (entry: FeeEntry, now: number) => now - entry.updatedAt <= MAX_AGE;

/** Fees read now replace the previous ones; a vault whose read failed keeps its last fee until that is too old */
export function mergeFees(previous: FeeEntries, updated: ClmSwapFees, vaultIds: string[], now: number): FeeEntries {
  const merged: FeeEntries = {};
  for (const vaultId of vaultIds) {
    const fee = updated[vaultId];
    const last = previous[vaultId];
    if (fee) {
      merged[vaultId] = { fee, updatedAt: now };
    } else if (last && isFresh(last, now)) {
      merged[vaultId] = last;
    }
  }
  return merged;
}

function publish(next: FeeEntries) {
  entries = next;
  fees = mapValues(entries, entry => entry.fee);
}

async function updateAll() {
  const start = Date.now();
  const vaultsByChain = groupBy(getVaultsByType('cowcentrated'), vault => vault.chain);
  const chains = Object.keys(vaultsByChain).filter(isApiChain);
  const results = await contextAllSettled(chains, chain =>
    withTimeout(fetchChainSwapFees(chain, vaultsByChain[chain]), CHAIN_TIMEOUT, `${chain} swap fees`)
  );

  const updated: ClmSwapFees = Object.assign({}, ...results.filter(isContextResultFulfilled).map(r => r.value));
  const vaultIds = chains.flatMap(chain => vaultsByChain[chain].map(vault => vault.id));
  publish(mergeFees(entries, updated, vaultIds, Date.now()));

  const rejected = results.filter(isContextResultRejected);
  rejected.forEach(result => logger.warn({ chain: result.context, err: result.reason }, 'chain update failed'));
  logger.info(
    {
      count: Object.keys(fees).length,
      updated: Object.keys(updated).length,
      failedChains: rejected.length,
      durationMs: Date.now() - start,
    },
    'cow swap fees updated'
  );
  await setKey(CACHE_KEY, entries);
}

function scheduleUpdate(delay: number) {
  setTimeout(() => {
    updateAll()
      .catch(err => logger.error({ err }, 'update failed'))
      .finally(() => scheduleUpdate(REFRESH_INTERVAL));
  }, delay);
}

export async function initCowSwapFeesService() {
  const cached = await getKey<FeeEntries>(CACHE_KEY);
  if (cached) {
    const now = Date.now();
    publish(pickBy(cached, entry => isFresh(entry, now)));
  }
  await serviceEventBus.waitForFirstEvent('vaults/updated');
  scheduleUpdate(INIT_DELAY);
}
