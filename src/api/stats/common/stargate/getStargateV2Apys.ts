import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from '../getApyBreakdown';
import { fetchPrice } from '../../../../utils/fetchPrice';
import { fetchContract } from '../../../rpc/client';
import IStargateRewarder from '../../../../abis/IStargateRewarder';
import IStargateMasterchef from '../../../../abis/IStargateMasterchef';

type RewardDetails = {
  address: string;
  oracleId: string;
  decimals: string;
};

type Reward = {
  rewardDetail: RewardDetails;
  rewardPerSec: BigNumber;
};

type PoolRewards = {
  rewards: Reward[];
};

export const getStargateV2Apys = async (params): Promise<ApyBreakdownResult> => {
  const farmApys = await getFarmApys(params);
  return getApyBreakdown(params.pools, {}, farmApys, 0);
};

const getFarmApys = async (params): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const [{ balances, poolRewards }] = await Promise.all([getPoolsData(params)]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];
    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    let yearlyRewardsInUsd = new BigNumber(0);
    for (let j = 0; j < poolRewards[i].rewards.length; j++) {
      const reward = poolRewards[i].rewards[j];
      const rewardPrice = await fetchPrice({ oracle: 'tokens', id: reward.rewardDetail.oracleId });
      const yearlyRewards = reward.rewardPerSec.times(secondsPerYear);
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(
        yearlyRewards.times(rewardPrice).dividedBy(reward.rewardDetail.decimals)
      );
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }

  return apys;
};

const getPoolsData = async params => {
  const masterchefContract = fetchContract(params.masterchef, IStargateMasterchef, params.chainId);
  const balanceCalls = [];
  params.pools.forEach(pool => {
    balanceCalls.push(masterchefContract.read.totalSupply([pool.address]));
  });

  const [balanceResults] = await Promise.all([Promise.all(balanceCalls)]);
  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v.toString()));

  const rewardDetailsCalls = [];
  const allocPointsByStakedCalls = [];
  params.pools.forEach(pool => {
    const rewarderContract = fetchContract(pool.rewarder, IStargateRewarder, params.chainId);
    allocPointsByStakedCalls.push(rewarderContract.read.allocPointsByStake([pool.address]));
    pool.rewards.forEach(reward => {
      rewardDetailsCalls.push(rewarderContract.read.rewardDetails([reward.address]));
    });
  });

  const [allocPointsByStakedResults, rewardDetailsResults] = await Promise.all([
    Promise.all(allocPointsByStakedCalls),
    Promise.all(rewardDetailsCalls),
  ]);
  const totalRewardPerSec: BigNumber[] = rewardDetailsResults.map(
    v => new BigNumber(v.rewardPerSec)
  );
  const totalAllocPoints: BigNumber[] = rewardDetailsResults.map(
    v => new BigNumber(v.totalAllocPoints)
  );
  const periodFinishes: BigNumber[] = rewardDetailsResults.map(v => new BigNumber(v.end));
  const poolRewards: PoolRewards[] = [];

  let i = 0;
  params.pools.forEach((pool, poolIndex) => {
    poolRewards.push({ rewards: [] });
    pool.rewards.forEach(reward => {
      const allocPointIndex = allocPointsByStakedResults[poolIndex][0].indexOf(reward.address);
      if (allocPointIndex != -1) {
        const allocPoint = new BigNumber(allocPointsByStakedResults[poolIndex][1][allocPointIndex]);
        let rewardPerSec = new BigNumber(0);
        if (periodFinishes[i] > new BigNumber(Date.now() / 1000)) {
          rewardPerSec = totalRewardPerSec[i].times(allocPoint).dividedBy(totalAllocPoints[i]);
        }
        poolRewards[poolIndex].rewards.push({
          rewardDetail: reward,
          rewardPerSec: rewardPerSec,
        });
      }
      i++;
    });
  });

  return { balances, poolRewards };
};
