import { ApiChain } from '../../utils/chain';
import { CowVaultMeta, CowVaultsMeta, isClmApiVaultsResponse } from './types';
import BigNumber from 'bignumber.js';
import { isAddressEqual } from 'viem';
import { getKey, setKey } from '../../utils/cache';
import { partition } from 'lodash';
import { sleep } from '../../utils/time';
import { isResultFulfilled } from '../../utils/promise';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { getCowPoolChains, getCowPools } from './getCowPools';

const CACHE_KEY = 'COW_VAULTS_META';
const INIT_DELAY = Number(process.env.COWCENTRATED_INIT_DELAY || 1000);
const UPDATE_INTERVAL = 60000;
const BEEFY_CLM_API = process.env.BEEFY_CLM_API || 'https://clm-api.beefy.finance';

const chainToVaults: Partial<Record<ApiChain, CowVaultsMeta>> = {};

export function getCowVaultsMeta(chainId: ApiChain): CowVaultMeta[] {
  if (!(chainId in chainToVaults)) {
    return [];
  }

  return chainToVaults[chainId]?.vaults || [];
}

export function getAllCowVaultsMeta(): Partial<Record<ApiChain, CowVaultsMeta>> {
  return chainToVaults;
}

async function fetchCowVaultsMeta(chainId: ApiChain): Promise<CowVaultMeta[]> {
  const pools = getCowPools(chainId);
  if (!pools || !pools.length) {
    return [];
  }

  const url = `${BEEFY_CLM_API}/api/v1/vaults/${chainId}/1d`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch vaults from CLM API for ${chainId}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!isClmApiVaultsResponse(data)) {
    throw new Error(`Invalid response data from CLM API for ${chainId}`);
  }

  return pools.map(pool => {
    const apiVault = data.find(v => isAddressEqual(v.vaultAddress, pool.address));
    if (!apiVault) {
      throw new Error(
        `Missing vault data from CLM API for ${chainId} ${pool.oracleId} ${pool.address}`
      );
    }

    return {
      ...pool,
      currentPrice: priceToDecimal(
        apiVault.priceOfToken0InToken1,
        pool.decimals[0],
        pool.decimals[1]
      ),
      priceRangeMin: priceToDecimal(apiVault.priceRangeMin1, pool.decimals[0], pool.decimals[1]),
      priceRangeMax: priceToDecimal(apiVault.priceRangeMax1, pool.decimals[0], pool.decimals[1]),
      apr: apiVault.apr,
      apy: apiVault.apy,
    };
  });
}

async function updateChain(chainId: ApiChain) {
  const vaults = await fetchCowVaultsMeta(chainId);
  return {
    updatedAt: Date.now(),
    chain: chainId,
    vaults,
  };
}

async function updateAll() {
  try {
    console.log('> [CLM Meta] Updating cow vaults metadata...');
    const start = Date.now();
    const updates = await Promise.allSettled(getCowPoolChains().map(updateChain));
    const [fulfilled, rejected] = partition(updates, isResultFulfilled);

    if (fulfilled.length) {
      for (const { value } of fulfilled) {
        chainToVaults[value.chain] = {
          updatedAt: value.updatedAt,
          vaults: value.vaults,
        };
      }
      await saveToCache();
    }

    const timing = (Date.now() - start) / 1000;
    console.log(
      `> [CLM Meta] Cow vaults metadata updated in ${timing}s, successes: ${fulfilled.length}, failures: ${rejected.length}`
    );
    rejected.forEach(({ reason }) => console.error(reason));

    serviceEventBus.emit('cowcentrated/vaults-meta/updated');
  } finally {
    scheduleUpdate();
  }
}

function scheduleUpdate() {
  sleep(UPDATE_INTERVAL)
    .then(updateAll)
    .catch(err => {
      console.error(`> [CLM Meta] Update all failed`, err);
      scheduleUpdate();
    });
}

function priceToDecimal(value: string, decimal0: number, decimal1: number): string {
  return new BigNumber(value).shiftedBy(decimal0 - decimal1).toString(10);
}

export async function initCowVaultsMetaService() {
  console.log(' > [CLM Meta] Initializing...');
  await loadFromCache();
  setTimeout(updateAll, INIT_DELAY);
}

async function loadFromCache() {
  const cached = await getKey<Partial<Record<ApiChain, CowVaultsMeta>>>(CACHE_KEY);
  if (cached) {
    Object.assign(chainToVaults, cached);
    serviceEventBus.emit('cowcentrated/vaults-meta/loaded');
  }
}

async function saveToCache() {
  await setKey(CACHE_KEY, chainToVaults);
}
