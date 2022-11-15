import { MultiCall } from 'eth-multicall';
import { ethereumWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import {
  getCurveBaseApys,
  // getCurveBaseApysOld,
} from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import IRewardPool from '../../../abis/IRewardPool.json';
import AuraToken from '../../../abis/ethereum/AuraToken.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';

const lpPools = require('../../../data/ethereum/convexPools.json');
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
  const baseApys = await getCurveBaseApys(lpPools, subgraphUrl);
  // const baseApys = await getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rewardPoolCalls = [];
  const extraRewardCalls = [];
  pools.forEach(pool => {
    const rewardPool = getContract(IRewardPool, pool.rewardPool);
    rewardPoolCalls.push({
      totalSupply: rewardPool.methods.totalSupply(),
      rewardRate: rewardPool.methods.rewardRate(),
      periodFinish: rewardPool.methods.periodFinish(),
    });
    pool.extras?.forEach(extra => {
      const extraRewards = getContract(IRewardPool, extra.rewardPool);
      extraRewardCalls.push({
        pool: pool.name,
        rewardPool: extra.rewardPool,
        rewardRate: extraRewards.methods.rewardRate(),
        periodFinish: extraRewards.methods.periodFinish(),
      });
    });
  });

  const res = await multicall.all([rewardPoolCalls, extraRewardCalls]);
  const poolInfo = res[0].map(v => ({
    totalSupply: new BigNumber(v.totalSupply),
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }));
  const extras = res[1].map(v => ({
    ...v,
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }));

  const cvx = getContractWithProvider(AuraToken, cvxAddress, web3);
  const cvxSupply = new BigNumber(await cvx.methods.totalSupply().call());
  const cvxPrice = await fetchPrice({ oracle: 'tokens', id: 'CVX' });
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const crvRewards = info.rewardRate.times(secondsPerYear);
    const crvRewardsInUsd = crvRewards.times(crvPrice).div('1e18');

    const cvxRewards = getMintedCvxAmount(crvRewards, cvxSupply);
    const cvxRewardsInUsd = cvxRewards.times(cvxPrice).div('1e18');

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

function getMintedCvxAmount(crvAmount, cvxSupply) {
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
