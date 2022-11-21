import { getContract, getContractWithProvider } from '../../../../utils/contractHelper';
import ICurveGauge from '../../../../abis/ICurveGauge.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../../utils/fetchPrice';
import IRewardPool from '../../../../abis/IRewardPool.json';

const IBooster = [
  {
    name: 'fees',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
  },
];

const booster = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';
const voterProxy = '0x989AEb4d175e16225E39E87d0D97A3360524AD80';
const secondsPerYear = 31536000;

export const getConvexApyData = async (web3, multicall, pools) => {
  const apys = [];

  const Booster = getContractWithProvider(IBooster, booster, web3);
  const fees = new BigNumber(await Booster.methods.fees().call());
  const afterFees = new BigNumber(10000).minus(fees).div(new BigNumber(10000));
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const calls = [];
  const extraCalls = [];
  pools.forEach(pool => {
    const gauge = getContract(ICurveGauge, pool.gauge);
    calls.push({
      rewardRate: gauge.methods.inflation_rate(weekEpoch),
      totalSupply: gauge.methods.totalSupply(),
      workingSupply: gauge.methods.working_supply(),
      balance: gauge.methods.balanceOf(voterProxy),
      workingBalance: gauge.methods.working_balances(voterProxy),
    });
    pool.extras?.forEach(extra => {
      const extraRewards = getContract(IRewardPool, extra.rewardPool);
      extraCalls.push({
        pool: pool.name,
        rewardPool: extra.rewardPool,
        rewardRate: extraRewards.methods.rewardRate(),
        periodFinish: extraRewards.methods.periodFinish(),
        totalSupply: extraRewards.methods.totalSupply(),
      });
    });
  });

  const res = await multicall.all([calls, extraCalls]);

  const poolInfo = res[0].map(v => ({
    rewardRate: new BigNumber(v.rewardRate),
    totalSupply: new BigNumber(v.totalSupply),
    workingSupply: new BigNumber(v.workingSupply),
    balance: new BigNumber(v.balance),
    workingBalance: new BigNumber(v.workingBalance),
  }));

  const extras = res[1].map(v => ({
    ...v,
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
    totalSupply: new BigNumber(v.totalSupply),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.workingSupply.times(lpPrice);
    const boost = info.workingBalance > 0 ? info.workingBalance.div(info.balance) : 1;

    const crvAPY = info.rewardRate
      .times(secondsPerYear)
      .times(crvPrice)
      .times(boost)
      .div(totalStakedInUsd)
      .times(afterFees);

    let totalApy = crvAPY;

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.extras.find(e => e.rewardPool === extra.rewardPool);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price);
      const apy = extraRewardsInUsd.div(info.balance.times(lpPrice));
      totalApy = totalApy.plus(apy);

      // console.log(pool.name, poolExtra.oracleId, apy.valueOf());
    }
    apys.push(totalApy);

    // console.log(pool.name, totalApy.valueOf(), 'crv', crvAPY.valueOf());
  }
  return apys;
};
