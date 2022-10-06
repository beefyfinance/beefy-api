import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { getKey, setKey } from '../../utils/redisHelper';
import { getBoostPeriodFinish, getBoosts } from './fetchBoostData';

const REDIS_KEY = 'BOOSTS_BY_CHAIN';

const INIT_DELAY = 4 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let boostsByChain: Record<string, any[]> = {};
let allBoosts = [];

export const getAllBosts = () => {
  return allBoosts;
};

export const getChainBoosts = chain => {
  return boostsByChain[chain];
};

const updateBoosts = async () => {
  console.log('> updating boosts');
  let start = Date.now();

  try {
    let promises = [];
    for (const [chain, url] of Object.entries(MULTICHAIN_ENDPOINTS)) {
      //App may use different chain name than that from the key used in the object, eg: one -> harmony
      const appUrlName = url.split('.json')[0].split('/').slice(-1)[0];
      promises.push(updateChainBoosts(chain, appUrlName));
    }

    await Promise.all(promises);

    allBoosts = Object.values(boostsByChain).reduce(
      (accumulator, current) => [...accumulator, ...current],
      []
    );

    console.log(`> updated ${allBoosts.length} boosts (${(Date.now() - start) / 1000}s)`);
    saveToRedis();
  } catch (error) {
    console.error(`> boosts update failed `, error);
  }

  setTimeout(updateBoosts, REFRESH_INTERVAL);
};

const updateChainBoosts = async (chain: string, appUrlName: string) => {
  try {
    let chainBoosts = await getBoosts(appUrlName);
    chainBoosts.forEach(boost => (boost.chain = chain));
    chainBoosts = await getBoostPeriodFinish(chain, chainBoosts);
    boostsByChain[chain] = chainBoosts;
  } catch (error) {
    console.log(`> failed to update boosts on ${chain}`);
    console.log(error.message);
  }
};

const saveToRedis = async () => {
  await setKey(REDIS_KEY, boostsByChain);
  console.log('> Boosts saved to redis');
};

export const initBoostService = async () => {
  const cachedBoosts = await getKey(REDIS_KEY);

  boostsByChain = cachedBoosts ?? {};
  allBoosts = Object.values(boostsByChain).reduce(
    (accumulator: any, current: any[]) => [...accumulator, ...current],
    []
  );

  setTimeout(updateBoosts, INIT_DELAY);
};
