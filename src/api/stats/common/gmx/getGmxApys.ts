import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import DistributorAbi from '../../../../abis/arbitrum/Distributor.ts';
import RewardTrackerAbi from '../../../../abis/arbitrum/RewardTracker.ts';
import StrategyABI from '../../../../abis/StrategyABI.ts';
import { fetchPrice } from '../../../../utils/fetchPrice.ts';
import { fetchContract } from '../../../rpc/client.ts';
import { type ApyBreakdownResult, getApyBreakdown } from '../getApyBreakdown.ts';
import type { GmxPool } from './types.ts';

export interface GmxApysParams {
  pools: GmxPool[];
  trackers: Tracker[];
  chainId: ChainId;
}

export interface Tracker {
  address: string;
  distributor: string;
  reward: Reward;
}

export interface Reward {
  symbol: string;
  decimals: string;
}

const SECONDS_PER_YEAR = 31536000;

export const getGmxCommonApys = async (params: GmxApysParams): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = await Promise.all(params.pools.map(pool => getPoolApy(params, pool)));

  return getApyBreakdown(params.pools, {}, farmAprs, 0);
};

const getPoolApy = async (params: GmxApysParams, pool: GmxPool): Promise<BigNumber> => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool),
    getTotalStakedInUsd(params, pool),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (params: GmxApysParams, pool: GmxPool): Promise<BigNumber> => {
  let yearlyRewardsInUsd: BigNumber = new BigNumber(0);
  const values = await Promise.all(params.trackers.map(tracker => getTrackerRewards(params, pool, tracker)));
  for (const item of values) {
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(item);
  }
  return yearlyRewardsInUsd;
};

const getTrackerRewards = async (params: GmxApysParams, pool: GmxPool, tracker: Tracker): Promise<BigNumber> => {
  const rewardTrackerContract = fetchContract(tracker.address, RewardTrackerAbi, params.chainId);
  const distributorContract = fetchContract(tracker.distributor, DistributorAbi, params.chainId);

  const res = await Promise.all([
    distributorContract.read.tokensPerInterval(),
    rewardTrackerContract.read.stakedAmounts([pool.strat as Address]),
    rewardTrackerContract.read.totalSupply(),
  ]);

  const rewardPerSecond = new BigNumber(res[0].toString());
  const stakedAmounts = new BigNumber(res[1].toString());
  const totalSupply = new BigNumber(res[2].toString());

  let yearlyRewardsInUsd = new BigNumber(0);
  const price = await fetchPrice({ oracle: 'tokens', id: tracker.reward.symbol });
  yearlyRewardsInUsd = yearlyRewardsInUsd.plus(
    rewardPerSecond.times(SECONDS_PER_YEAR).times(price).dividedBy(tracker.reward.decimals)
  );

  return yearlyRewardsInUsd.times(stakedAmounts).dividedBy(totalSupply);
};

const getTotalStakedInUsd = async (params: GmxApysParams, pool: GmxPool): Promise<BigNumber> => {
  let staked: BigNumber = new BigNumber(0);
  if (pool.glp) {
    const strategy = fetchContract(pool.strat, StrategyABI, params.chainId);
    staked = new BigNumber((await strategy.read.balanceOf()).toString());
  } else {
    const stakedTrackerContract = fetchContract(pool.stakedTracker, RewardTrackerAbi, params.chainId);
    staked = new BigNumber(
      (await stakedTrackerContract.read.depositBalances([pool.strat as Address, pool.address as Address])).toString()
    );
  }
  const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return staked.times(stakedPrice).dividedBy(pool.decimals);
};
