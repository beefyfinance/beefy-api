import { ETH_CHAIN_ID } from '../../../constants';
import {
  getCurveBaseApys,
  // getCurveBaseApysOld,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import IRewardPool from '../../../abis/IRewardPool';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const lpPools = require('../../../data/ethereum/convexPools.json').filter(p => p.rewardPool);
const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/ethereum';
// const baseApyUrl = 'https://stats.curve.fi/raw-stats/apys.json';
// const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs';
const tradingFees = 0.0002;
const secondsPerYear = 31536000;
const cvxAddress = '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B';

const pools = [
  {
    name: 'convex-staked-cvxCRV',
    rewardPool: '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e',
    extras: [
      {
        rewardPool: '0x7091dbb7fcbA54569eF1387Ac89Eb2a5C9F6d2EA',
        oracle: 'lps',
        oracleId: 'convex-3pool',
      },
    ],
  },
  ...lpPools,
];

export const getConvexApys = async () => {
  // const baseApys = await getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl);
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(lpPools, subgraphUrl),
    getPoolApys(pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  const totalSupplyCalls = [],
    rewardRateCalls = [],
    periodFinishCalls = [];
  const extraRewardInfo = [],
    extraRewardRateCalls = [],
    extraPeriodFinishCalls = [];
  pools.forEach(pool => {
    const rewardPool = fetchContract(pool.rewardPool, IRewardPool, ETH_CHAIN_ID);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    rewardRateCalls.push(rewardPool.read.rewardRate());
    periodFinishCalls.push(rewardPool.read.periodFinish());
    pool.extras?.forEach(extra => {
      const extraRewards = fetchContract(extra.rewardPool, IRewardPool, ETH_CHAIN_ID);
      extraRewardInfo.push({ pool: pool.name, rewardPool: extra.rewardPool });
      extraRewardRateCalls.push(extraRewards.read.rewardRate());
      extraPeriodFinishCalls.push(extraRewards.read.periodFinish());
    });
  });
  const cvx = fetchContract(cvxAddress, ERC20Abi, ETH_CHAIN_ID);
  const cvxSupplyCall = cvx.read.totalSupply();

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraRewardRateCalls),
    Promise.all(extraPeriodFinishCalls),
    cvxSupplyCall,
  ]);
  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i].toString()),
    rewardRate: new BigNumber(res[1][i].toString()),
    periodFinish: new BigNumber(res[2][i].toString()),
  }));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[3][i].toString()),
    periodFinish: new BigNumber(res[4][i].toString()),
  }));

  const cvxSupply = new BigNumber(res[5].toString());
  const cvxPrice = await fetchPrice({ oracle: 'tokens', id: 'CVX' });
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    let crvRewardsInUsd = new BigNumber(0);
    let cvxRewardsInUsd = new BigNumber(0);
    if (info.periodFinish > Date.now() / 1000) {
      const crvRewards = info.rewardRate.times(secondsPerYear);
      crvRewardsInUsd = crvRewards.times(crvPrice).div('1e18');
      const cvxRewards = getMintedCvxAmount(crvRewards, cvxSupply);
      cvxRewardsInUsd = cvxRewards.times(cvxPrice).div('1e18');
    }

    let lpPrice;
    if (pool.name === 'convex-staked-cvxCRV') {
      lpPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxCRV' });
    } else {
      lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    }
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = crvRewardsInUsd.plus(cvxRewardsInUsd);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.extras.find(e => e.rewardPool === extra.rewardPool);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name, apy.valueOf(), 'crv', crvRewardsInUsd.div(totalStakedInUsd).valueOf(), 'cvx', cvxRewardsInUsd.div(totalStakedInUsd).valueOf())
  }
  return apys;
};

export function getMintedCvxAmount(crvAmount, cvxSupply) {
  const totalCliffs = new BigNumber(1000);
  const reductionPerCliff = new BigNumber(100000000000000000000000);
  const cliff = cvxSupply.div(reductionPerCliff).integerValue(BigNumber.ROUND_DOWN);
  let amount = new BigNumber(0);
  if (cliff.lt(totalCliffs)) {
    //for reduction% take inverse of current cliff
    const reduction = totalCliffs.minus(cliff);
    //reduce
    amount = crvAmount.times(reduction).div(totalCliffs);
  }
  return amount;
}
