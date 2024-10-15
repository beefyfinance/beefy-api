import { ApiChain } from '../../utils/chain';
import { AnyCowClmMeta, CowClmsMeta, isClmApiVaultsResponse } from './types';
import { isAddressEqual } from 'viem';
import { getKey, setKey } from '../../utils/cache';
import { partition } from 'lodash';
import { sleep } from '../../utils/time';
import { isResultFulfilled } from '../../utils/promise';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { getCowClmChains, getCowClms } from './getCowClms';

const CACHE_KEY = 'COW_VAULTS_META';
const INIT_DELAY = Number(process.env.COWCENTRATED_INIT_DELAY || 1000);
const UPDATE_INTERVAL = 60000;
const BEEFY_CLM_API = process.env.BEEFY_CLM_API || 'https://clm-api.beefy.finance';

const chainToVaults: Partial<Record<ApiChain, CowClmsMeta>> = {};

export function getCowVaultsMeta(chainId: ApiChain): AnyCowClmMeta[] {
  if (!(chainId in chainToVaults)) {
    return [];
  }

  return chainToVaults[chainId]?.vaults || [];
}

export function getAllCowVaultsMeta(): Partial<Record<ApiChain, CowClmsMeta>> {
  return chainToVaults;
}

async function fetchCowVaultsMeta(chainId: ApiChain): Promise<AnyCowClmMeta[]> {
  const pools = getCowClms(chainId);
  if (!pools || !pools.length) {
    return [];
  }

  // rootstock is expensive to harvest so we don't harvest it as often
  // ask the api to compute metrics over a longer period of time
  // to ensure we have some data to base metrics on
  const period = chainId === 'rootstock' ? '3.1d' : '1.1d';
  const url = `${BEEFY_CLM_API}/api/v1/vaults/${chainId}/${period}`;
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
      console.error(`Missing vault data from CLM API for ${chainId} ${pool.oracleId} ${pool.address}`);
      return {
        ...pool,
        currentPrice: '0',
        priceRangeMin: '0',
        priceRangeMax: '0',
        apr: '0',
        apy: '0',
      };
    }

    return {
      ...pool,
      currentPrice: apiVault.priceOfToken0InToken1,
      priceRangeMin: apiVault.priceRangeMin1,
      priceRangeMax: apiVault.priceRangeMax1,
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
    const updates = await Promise.allSettled(getCowClmChains().map(updateChain));
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

export async function initCowVaultsMetaService() {
  console.log(' > [CLM Meta] Initializing...');
  await loadFromCache();
  setTimeout(updateAll, INIT_DELAY);
}

async function loadFromCache() {
  const cached = await getKey<Partial<Record<ApiChain, CowClmsMeta>>>(CACHE_KEY);
  if (cached) {
    Object.assign(chainToVaults, cached);
    serviceEventBus.emit('cowcentrated/vaults-meta/loaded');
  }
}

async function saveToCache() {
  await setKey(CACHE_KEY, chainToVaults);
}
