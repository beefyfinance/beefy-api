import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { getKey, setKey } from '../../utils/cache';
import { getBoostPeriodFinish, getBoosts } from './fetchBoostData';
import { Boost } from './types';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { isResultFulfilled, isResultRejected, withTimeout } from '../../utils/promise';
import { ApiChain, toAppChain } from '../../utils/chain';

const REDIS_KEY = 'BOOSTS_BY_CHAIN';

const INIT_DELAY = Number(process.env.BOOSTS_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 5 * 60 * 1000;

let boostsByChain: Record<string, Boost[]> = {};
let allBoosts: Boost[] = [];

export const getAllBoosts = () => {
  return allBoosts;
};

export const getChainBoosts = chain => {
  return boostsByChain[chain];
};

const updateBoosts = async () => {
  console.log('> updating boosts');

  try {
    const start = Date.now();
    const timeout = Math.floor(REFRESH_INTERVAL / 2);
    const results = await Promise.allSettled(
      Object.keys(MULTICHAIN_ENDPOINTS).map(chain =>
        withTimeout(updateChainBoosts(chain as ApiChain), timeout)
      )
    );
    const fulfilled = results.filter(isResultFulfilled);

    if (fulfilled.length) {
      // TODO: add TTL so entries are removed if not updated (e.g. chain rpc is down)
      buildFromChains();
      await saveToRedis();
    }

    console.log(
      `> Boosts for ${fulfilled.length}/${results.length} chains updated: ${
        allBoosts.length
      } boosts (${(Date.now() - start) / 1000}s)`
    );

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isResultRejected);
      console.error(` - ${rejected.length} chains failed to update:`);
      rejected.forEach(result => console.error(`  - ${result.reason}`));
    }
  } catch (err) {
    console.error('> boost update failed', err);
  }

  setTimeout(updateBoosts, REFRESH_INTERVAL);
};

function buildFromChains() {
  allBoosts = Object.values(boostsByChain).flat();

  Object.keys(boostsByChain).forEach(chain => serviceEventBus.emit(`boosts/${chain}/ready`));
  serviceEventBus.emit('boosts/updated');
}

async function updateChainBoosts(chain: ApiChain) {
  let chainBoosts: Boost[] = await getBoosts(toAppChain(chain));
  chainBoosts.forEach(boost => (boost.chain = chain));
  chainBoosts = await getBoostPeriodFinish(chain, chainBoosts);
  boostsByChain[chain] = chainBoosts;
}

async function loadFromRedis() {
  const cachedBoosts = await getKey<Record<string, Boost[]>>(REDIS_KEY);

  if (cachedBoosts && typeof cachedBoosts === 'object') {
    boostsByChain = cachedBoosts;
    buildFromChains();
  }
}

async function saveToRedis() {
  await setKey(REDIS_KEY, boostsByChain);
}

export async function initBoostService() {
  await loadFromRedis();
  setTimeout(updateBoosts, INIT_DELAY);
}
