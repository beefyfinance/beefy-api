import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { default as ICurveGauge } from '../../../../abis/ICurveGauge.ts';
import { default as ICurveRewardStream } from '../../../../abis/ICurveRewardStream.ts';
import { default as ICurveRewards } from '../../../../abis/ICurveRewards.ts';
import { fetchPrice } from '../../../../utils/fetchPrice.ts';
import { fetchContract } from '../../../rpc/client.ts';

const secondsPerYear = 31536000;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type BalancerApyReward = {
  token?: string;
  rewardToken?: string;
  stream?: string;
  newGauge?: boolean;
  oracle?: string;
  oracleId: string;
  decimals?: string;
};

export type BalancerApyPool = {
  name: string;
  gauge?: string;
  boosted?: boolean;
  rewards?: BalancerApyReward[];
};

type BalancerGaugedPool = BalancerApyPool & { gauge: string };

const hasGauge = (pool: BalancerApyPool | undefined): pool is BalancerGaugedPool =>
  !!pool?.gauge && typeof pool.gauge === 'string' && pool.gauge.toLowerCase() !== ZERO_ADDRESS;

export const getTotalStakedInUsd = async (chainId: ChainId, pool: BalancerApyPool) => {
  if (!hasGauge(pool)) return new BigNumber(1);
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const totalSupply = new BigNumber(await gauge.read.totalSupply());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy('1e18');
};

export const getBoostedYearlyRewardsInUsd = async (chainId: ChainId, pool: BalancerApyPool, tokenID?: string) => {
  if (!hasGauge(pool)) return new BigNumber(0);
  const id = tokenID !== undefined ? tokenID : 'CRV';
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: id });

  // boosted CRV rewards calculated based on working_supply, not totalSupply
  // but additional rewards calculated from totalSupply
  // we return totalSupply in getTotalStaked and increase rewards here by (* totalSupply / workingSupply)
  // so total APY can be calculated as yearlyRewards / totalStaked
  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
  const calls = [gauge.read.inflation_rate([BigInt(weekEpoch)]), gauge.read.totalSupply(), gauge.read.working_supply()];

  const res = await Promise.all(calls);

  const rewardRate = new BigNumber(res[0]);
  const totalSupply = new BigNumber(res[1]);
  const workingSupply = new BigNumber(res[2]);

  return rewardRate
    .times(secondsPerYear)
    .times(0.4)
    .times(crvPrice)
    .times(totalSupply)
    .div(workingSupply)
    .dividedBy('1e18');
};

export const getYearlyRewardsInUsd = async (chainId: ChainId, pool: BalancerApyPool) => {
  let [yearRewardsInUsd, ratesAndPeriods] = await Promise.all([
    pool.boosted
      ? getBoostedYearlyRewardsInUsd(chainId, pool)
      : new Promise<BigNumber>(resolve => resolve(new BigNumber(0))),
    getPoolsRatesAndPeriodFinish(chainId, pool),
  ]);

  const { rewardRates, periodsFinish } = ratesAndPeriods;

  for (const [index, rewards] of Object.entries(pool.rewards ?? [])) {
    const rewardRate = rewardRates[Number(index)];
    const periodFinish = periodsFinish[Number(index)];

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

const getPoolsRatesAndPeriodFinish = async (chainId: ChainId, pool: BalancerApyPool) => {
  const periodFinishCalls: Promise<number | bigint>[] = [];
  const rewardRateCalls: Promise<number | bigint>[] = [];
  (pool.rewards ?? []).forEach(rewards => {
    // FIXME(unsafe-cast): may be undefined
    const stream = rewards.stream as string;
    if (pool.boosted || rewards.rewardToken) {
      if (!hasGauge(pool)) {
        periodFinishCalls.push(new Promise(resolve => resolve(0)));
        rewardRateCalls.push(new Promise(resolve => resolve(0)));
        return;
      }
      const token = rewards.rewardToken ? rewards.rewardToken : rewards.token;
      const rewardStream = fetchContract(pool.gauge, ICurveGauge, chainId);
      // FIXME(unsafe-cast): may be undefined
      const call = rewardStream.read.reward_data([token as Address]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else if (rewards.newGauge) {
      const rewardStream = fetchContract(stream, ICurveGauge, chainId);
      const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
      const periodFinish = (weekEpoch + 1) * (86400 * 7) + 86400;

      periodFinishCalls.push(new Promise(resolve => resolve(periodFinish)));
      rewardRateCalls.push(rewardStream.read.inflation_rate([BigInt(weekEpoch)]));
    } else if (rewards.token) {
      const rewardStream = fetchContract(stream, ICurveRewards, chainId);
      const call = rewardStream.read.reward_data([rewards.token as Address]);

      periodFinishCalls.push(call.then(res => res[1]));
      rewardRateCalls.push(call.then(res => res[2]));
    } else {
      const rewardStream = fetchContract(stream, ICurveRewardStream, chainId);

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
