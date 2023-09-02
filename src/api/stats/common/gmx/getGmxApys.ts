import BigNumber from 'bignumber.js';
import fetchPrice from '../../../../utils/fetchPrice';
import { LpPool } from '../../../../types/LpPool';
import { ChainId } from '../../../../../packages/address-book/address-book';
import StrategyABI from '../../../../abis/StrategyABI';
import RewardTrackerAbi from '../../../../abis/arbitrum/RewardTracker';
import DistributorAbi from '../../../../abis/arbitrum/Distributor';
import { fetchContract } from '../../../rpc/client';
import getApyBreakdown, { ApyBreakdownResult } from '../getApyBreakdown';
import { getEDecimals } from '../../../../utils/getEDecimals';

export interface GmxApysParams {
  pools: LpPool[];
  trackers: Tracker[];
  rewards: Reward[];
  chainId: ChainId;
}

export interface Tracker {
  address: string;
  distributor: string;
}

export interface Reward {
  symbol: string;
  address: string;
  decimals: string;
}

const SECONDS_PER_YEAR = 31536000;

export const getGmxCommonApys = async (params: GmxApysParams): Promise<ApyBreakdownResult> => {
  let promises = [];
  let farmAprs: BigNumber[] = [];
  params.pools.forEach(pool => promises.push(getPoolApy(params, pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmAprs.push(item);
  }

  return getApyBreakdown(params.pools, {}, farmAprs, 0);
};

const getPoolApy = async (params, pool): Promise<BigNumber> => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool),
    getTotalStakedInUsd(params, pool),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (params: GmxApysParams, pool): Promise<BigNumber> => {
  let promises = [];
  let yearlyRewardsInUsd: BigNumber = new BigNumber(0);
  params.trackers.forEach(tracker => promises.push(getTrackerRewards(params, pool, tracker)));
  const values = await Promise.all(promises);
  for (const item of values) {
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(item);
  }
  return yearlyRewardsInUsd;
};

const getTrackerRewards = async (params, pool, tracker): Promise<BigNumber> => {
  const rewardTrackerContract = fetchContract(tracker.address, RewardTrackerAbi, params.chainId);
  const distributorContract = fetchContract(tracker.distributor, DistributorAbi, params.chainId);

  const tokensPerIntervalCalls = [];
  if (params.rewards.length > 1) {
    params.rewards.forEach(reward => {
      tokensPerIntervalCalls.push(distributorContract.read.tokensPerInterval([reward.address]));
    });
  } else {
    tokensPerIntervalCalls.push(distributorContract.read.tokensPerInterval());
  }

  const res = await Promise.all([
    Promise.all(tokensPerIntervalCalls),
    rewardTrackerContract.read.stakedAmounts([pool.strat]),
    rewardTrackerContract.read.totalSupply(),
  ]);

  const rewardPerSeconds: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const stakedAmounts = new BigNumber(res[1].toString());
  const totalSupply = new BigNumber(res[2].toString());

  let yearlyRewardsInUsd = new BigNumber(0);
  for (let i = 0; i < params.rewards.length; ++i) {
    const price = await fetchPrice({ oracle: 'tokens', id: params.rewards[i].symbol });
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(
      rewardPerSeconds[i]
        .times(SECONDS_PER_YEAR)
        .times(price)
        .dividedBy(getEDecimals(params.rewards[i].decimals))
    );
  }

  return yearlyRewardsInUsd.times(stakedAmounts).dividedBy(totalSupply);
};

const getTotalStakedInUsd = async (params: GmxApysParams, pool): Promise<BigNumber> => {
  let staked: BigNumber = new BigNumber(0);
  if (pool.glp) {
    const strategy = fetchContract(pool.strat, StrategyABI, params.chainId);
    staked = new BigNumber((await strategy.read.balanceOf()).toString());
  } else {
    const stakedTrackerContract = fetchContract(
      pool.stakedTracker,
      RewardTrackerAbi,
      params.chainId
    );
    staked = new BigNumber(
      (await stakedTrackerContract.read.depositBalances([pool.strat, pool.address])).toString()
    );
  }
  const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return staked.times(stakedPrice).dividedBy(pool.decimals);
};
