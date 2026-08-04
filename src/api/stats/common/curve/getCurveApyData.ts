import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from '../../../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'apy', component: 'curve' });

export type CurveApyDataPool = {
  name: string;
  pool: string;
};

type CurveVolumesApiPool = {
  address: string;
  latestDailyApyPcent: number;
  latestWeeklyApyPcent: number;
};

type CurveVolumesApiResponse = {
  data: {
    pools: CurveVolumesApiPool[];
  };
};

type CurveSubgraphApiPool = {
  address: string;
  latestDailyApy: number;
  latestWeeklyApy: number;
};

type CurveSubgraphApiResponse = {
  data: {
    poolList: CurveSubgraphApiPool[];
  };
};

type CurveBaseApysApiPool = {
  address: string;
  latestDailyApyPcent: number;
  latestWeeklyApyPcent: number;
};

type CurveBaseApysApiResponse = {
  data: {
    baseApys: CurveBaseApysApiPool[];
  };
};

export async function getCurveVolumeApys(pools: CurveApyDataPool[], url: string) {
  let apys: Record<string, BigNumber> = {};
  try {
    // FIXME(unsafe-cast): unchecked response shape
    const response = (await fetch(url).then(res => res.json())) as CurveVolumesApiResponse;
    const apyData = response.data.pools;
    pools.forEach(pool => {
      const poolData = apyData.find(p => p.address.toLowerCase() === pool.pool.toLowerCase());
      let apy: number | BigNumber = 0;
      if (poolData) apy = Math.max(poolData.latestDailyApyPcent, poolData.latestWeeklyApyPcent);
      apy = new BigNumber(Number(apy) / 100);
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    logger.warn({ url, err }, 'getVolumes fetch failed');
  }
  return apys;
}

export const getCurveSubgraphApys = async (pools: CurveApyDataPool[], url: string) => {
  let apys: Record<string, BigNumber> = {};
  try {
    // FIXME(unsafe-cast): unchecked response shape
    const response = (await fetch(url).then(res => res.json())) as CurveSubgraphApiResponse;
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

const getSubgraphDataApy = (apyData: CurveSubgraphApiPool[], poolAddress: string) => {
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
export const getCurveGetBaseApys = async (pools: CurveApyDataPool[], url: string) => {
  let apys: Record<string, BigNumber> = {};
  try {
    // FIXME(unsafe-cast): unchecked response shape
    const response = (await fetch(url).then(res => res.json())) as CurveBaseApysApiResponse;
    const apyData = response.data.baseApys;
    pools.forEach(pool => {
      // FIXME(unsafe-cast): may be undefined
      let poolData = apyData.find(p => p.address.toLowerCase() === pool.pool.toLowerCase()) as CurveBaseApysApiPool;
      let apy: number | BigNumber = 0;
      if (pool) apy = Math.max(poolData.latestDailyApyPcent, poolData.latestWeeklyApyPcent);
      apy = new BigNumber(Number(apy) / 100);
      apys = { ...apys, ...{ [pool.name]: apy } };
    });
  } catch (err) {
    logger.warn({ url, err }, 'getBaseApys fetch failed');
  }
  return apys;
};
