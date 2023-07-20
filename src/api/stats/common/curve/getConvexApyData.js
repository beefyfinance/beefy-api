import BigNumber from 'bignumber.js';
import fetchPrice from '../../../../utils/fetchPrice';
import IRewardPool from '../../../../abis/IRewardPool';
import ICurveGauge from '../../../../abis/ICurveGauge';
import { fetchContract } from '../../../rpc/client';
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

export const getConvexApyData = async (chainId, pools) => {
  const apys = [];

  const { fees, poolInfo, extras } = await getData(chainId, pools);
  const afterFees = new BigNumber(10000).minus(fees).div(new BigNumber(10000));
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

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

const getData = async (chainId, pools) => {
  const boosterContract = fetchContract(booster, IBooster, chainId);
  const feeCall = boosterContract.read.fees().then(v => new BigNumber(v.toString()));

  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));

  const gaugeRewardRatesCalls = [],
    gaugeTotalSuppliesCalls = [],
    gaugeWorkingSuppliesCalls = [],
    gaugeBalancesCalls = [],
    gaugeWorkingBalancesCalls = [];
  const extraData = [],
    extraRewardRatesCalls = [],
    extraPeriodFinishsCalls = [],
    extraTotalSuppliesCalls = [];
  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
    gaugeRewardRatesCalls.push(
      gauge.read.inflation_rate([weekEpoch]).then(v => new BigNumber(v.toString()))
    );
    gaugeTotalSuppliesCalls.push(gauge.read.totalSupply().then(v => new BigNumber(v.toString())));
    gaugeWorkingSuppliesCalls.push(
      gauge.read.working_supply().then(v => new BigNumber(v.toString()))
    );
    gaugeBalancesCalls.push(
      gauge.read.balanceOf([voterProxy]).then(v => new BigNumber(v.toString()))
    );
    gaugeWorkingBalancesCalls.push(
      gauge.read.working_balances([voterProxy]).then(v => new BigNumber(v.toString()))
    );
    pool.extras?.forEach(extra => {
      const extraRewards = fetchContract(extra.rewardPool, IRewardPool, chainId);
      extraData.push({ pool: pool.name, rewardPool: extra.rewardPool });
      extraRewardRatesCalls.push(
        extraRewards.read.rewardRate().then(v => new BigNumber(v.toString()))
      );
      extraPeriodFinishsCalls.push(
        extraRewards.read.periodFinish().then(v => new BigNumber(v.toString()))
      );
      extraTotalSuppliesCalls.push(
        extraRewards.read.totalSupply().then(v => new BigNumber(v.toString()))
      );
    });
  });

  const [
    fees,
    gaugeRewardRates,
    gaugeTotalSupplies,
    gaugeWorkingSupplies,
    gaugeBalances,
    gaugeWorkingBalances,
    extraRewardRates,
    extraPeriodFinishs,
    extraTotalSupplies,
  ] = await Promise.all([
    feeCall,
    Promise.all(gaugeRewardRatesCalls),
    Promise.all(gaugeTotalSuppliesCalls),
    Promise.all(gaugeWorkingSuppliesCalls),
    Promise.all(gaugeBalancesCalls),
    Promise.all(gaugeWorkingBalancesCalls),
    Promise.all(extraRewardRatesCalls),
    Promise.all(extraPeriodFinishsCalls),
    Promise.all(extraTotalSuppliesCalls),
  ]);

  const poolInfo = pools.map((v, i) => ({
    rewardRate: gaugeRewardRates[i],
    totalSupply: gaugeTotalSupplies[i],
    workingSupply: gaugeWorkingSupplies[i],
    balance: gaugeBalances[i],
    workingBalance: gaugeWorkingBalances[i],
  }));

  const extras = extraData.map((v, i) => ({
    ...v,
    rewardRate: extraRewardRates[i],
    periodFinish: extraPeriodFinishs[i],
    totalSupply: extraTotalSupplies[i],
  }));

  return { fees, poolInfo, extras };
};
