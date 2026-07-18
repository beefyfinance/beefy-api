import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from '../../../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'apy', platform: 'curve' });

export async function getCurveVolumeApys(pools, url) {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const apyData = response.data.pools;
    pools.forEach(pool => {
      const poolData = apyData.find(p => p.address.toLowerCase() === pool.pool.toLowerCase());
      let apy = 0;
      if (poolData) apy = Math.max(poolData.latestDailyApyPcent, poolData.latestWeeklyApyPcent);
      apy = new BigNumber(Number(apy) / 100);
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    logger.warn({ url, err }, 'getVolumes fetch failed');
  }
  return apys;
}

export const getCurveSubgraphApys = async (pools, url) => {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const apyData = response.data.poolList;
    pools.forEach(pool => {
      let apy = new BigNumber(getSubgraphDataApy(apyData, pool.pool));
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    logger.warn({ url }, 'base apy fetch failed');
  }
  return apys;
};

const getSubgraphDataApy = (apyData, poolAddress) => {
  try {
    let pool = apyData.find(p => p.address.toLowerCase() === poolAddress.toLowerCase());
    if (!pool) return 0;
    let apy = Math.max(pool.latestDailyApy, pool.latestWeeklyApy);
    return Number(apy) / 100;
  } catch (err) {
    logger.warn({ pool: poolAddress, err }, 'subgraph apy parse failed');
    return 0;
  }
};

// https://api.curve.finance/v1/getBaseApys/chain
export const getCurveGetBaseApys = async (pools, url) => {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    const apyData = response.data.baseApys;
    pools.forEach(pool => {
      let poolData = apyData.find(p => p.address.toLowerCase() === pool.pool.toLowerCase());
      let apy = 0;
      if (pool) apy = Math.max(poolData.latestDailyApyPcent, poolData.latestWeeklyApyPcent);
      apy = new BigNumber(Number(apy) / 100);
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    logger.warn({ url, err }, 'getBaseApys fetch failed');
  }
  return apys;
};
