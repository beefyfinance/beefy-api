import { ETH_CHAIN_ID } from '../../../constants';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import { parseAbi } from 'viem';

const pools = require('../../../data/ethereum/convexPools.json').filter(p => p.prismaPool);
const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/ethereum';
const tradingFees = 0.0002;
const secondsPerYear = 31536000;

export const getPrismaApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const prismaAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function periodFinish() view returns (uint32)',
  'function rewardRate(uint index) view returns (uint128)',
]);

const getPoolApys = async pools => {
  const apys = [];

  const totalSupplyCalls = [],
    periodFinishCalls = [];
  const extraRewardInfo = [],
    extraRewardRateCalls = [];
  pools.forEach(pool => {
    const rewardPool = fetchContract(pool.prismaPool, prismaAbi, ETH_CHAIN_ID);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    periodFinishCalls.push(rewardPool.read.periodFinish());
    extraRewardInfo.push({ pool: pool.name, oracleId: 'PRISMA' });
    extraRewardRateCalls.push(rewardPool.read.rewardRate([0]));
    extraRewardInfo.push({ pool: pool.name, oracleId: 'CRV' });
    extraRewardRateCalls.push(rewardPool.read.rewardRate([1]));
    if (pool.name.startsWith('prisma-convex')) {
      extraRewardInfo.push({ pool: pool.name, oracleId: 'CVX' });
      extraRewardRateCalls.push(rewardPool.read.rewardRate([2]));
    }
  });

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraRewardRateCalls),
  ]);
  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i].toString()),
    periodFinish: new BigNumber(res[1][i].toString()),
  }));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[2][i].toString()),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    if (info.periodFinish > Date.now() / 1000) {
      for (const extra of extras.filter(e => e.pool === pool.name)) {
        const price = await fetchPrice({
          oracle: extra.oracle ?? 'tokens',
          id: extra.oracleId,
        });
        const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price).div('1e18');
        yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
        // console.log(pool.name, extra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
      }
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.valueOf(), totalStakedInUsd.valueOf());
  }
  return apys;
};
