import BigNumber from 'bignumber.js';
import { fetchContract } from '../../../rpc/client';
import { fetchPrice } from '../../../../utils/fetchPrice';

const { default: ICurveGauge } = require('../../../../abis/ICurveGauge');
const { default: ICurveRewards } = require('../../../../abis/ICurveRewards');
const { default: ICurveRewardStream } = require('../../../../abis/ICurveRewardStream');

const secondsPerYear = 31536000;

export const getTotalStakedInUsd = async (chainId, pool) => {
  if (!pool.gauge) return new BigNumber(1);
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const totalSupply = new BigNumber((await gauge.read.totalSupply()).toString());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

export const getBoostedYearlyRewardsInUsd = async (chainId, pool, tokenID) => {
  const id = tokenID !== undefined ? tokenID : 'CRV';
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: id });

  // boosted CRV rewards calculated based on working_supply, not totalSupply
  // but additional rewards calculated from totalSupply
  // we return totalSupply in getTotalStaked and increase rewards here by (* totalSupply / workingSupply)
  // so total APY can be calculated as yearlyRewards / totalStaked
  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const calls = [
    gauge.read.inflation_rate([weekEpoch]),
    gauge.read.totalSupply(),
    gauge.read.working_supply(),
  ];

  const res = await Promise.all(calls);

  const rewardRate = new BigNumber(res[0].toString());
  const totalSupply = new BigNumber(res[1].toString());
  const workingSupply = new BigNumber(res[2].toString());

  return rewardRate
    .times(secondsPerYear)
    .times(0.4)
    .times(crvPrice)
    .times(totalSupply)
    .div(workingSupply)
    .dividedBy('1e18');
};

export const getYearlyRewardsInUsd = async (chainId, pool) => {
  let [yearRewardsInUsd, ratesAndPeriods] = await Promise.all([
    pool.boosted
      ? getBoostedYearlyRewardsInUsd(chainId, pool)
      : new Promise(resolve => resolve(new BigNumber(0))),
    getPoolsRatesAndPeriodFinish(chainId, pool),
  ]);

  const { rewardRates, periodsFinish } = ratesAndPeriods;

  for (const [index, rewards] of Object.entries(pool.rewards ?? [])) {
    const rewardRate = rewardRates[index];
    const periodFinish = periodsFinish[index];

    if (periodFinish < Date.now() / 1000) {
      continue;
    }

    const price = await fetchPrice({ oracle: rewards.oracle ?? 'tokens', id: rewards.oracleId });
    const rewardsInUsd = rewardRate
      .times(secondsPerYear)
      .times(price)
      .dividedBy(rewards.decimals ?? '1e18');
    yearRewardsInUsd = yearRewardsInUsd.plus(rewardsInUsd);
  }

  return yearRewardsInUsd;
};

const getPoolsRatesAndPeriodFinish = async (chainId, pool) => {
  const periodFinishCalls = [];
  const rewardRateCalls = [];
  (pool.rewards ?? []).forEach(rewards => {
    if (pool.boosted || rewards.rewardToken) {
      const token = rewards.rewardToken ? rewards.rewardToken : rewards.token;
      const rewardStream = fetchContract(pool.gauge, ICurveGauge, chainId);
      const call = rewardStream.read.reward_data([token]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else if (rewards.newGauge) {
      const rewardStream = fetchContract(rewards.stream, ICurveGauge, chainId);
      const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
      const periodFinish = (weekEpoch + 1) * (86400 * 7) + 86400;

      periodFinishCalls.push(new Promise(resolve => resolve(periodFinish)));
      rewardRateCalls.push(rewardStream.read.inflation_rate([weekEpoch]));
    } else if (rewards.token) {
      const rewardStream = fetchContract(rewards.stream, ICurveRewards, chainId);
      const call = rewardStream.read.reward_data([rewards.token]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else {
      const rewardStream = fetchContract(rewards.stream, ICurveRewardStream, chainId);

      periodFinishCalls.push(rewardStream.read.period_finish());
      rewardRateCalls.push(rewardStream.read.reward_rate());
    }
  });

  const res = await Promise.all([Promise.all(periodFinishCalls), Promise.all(rewardRateCalls)]);
  return {
    periodsFinish: res[0].map(v => Number(v)),
    rewardRates: res[1].map(v => new BigNumber(v.toString())),
  };
};
