import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../../utils/fetchPrice';
import { LpPool } from '../../../../types/LpPool';
import { ChainId } from '../../../../../packages/address-book/src/address-book';
import StrategyABI from '../../../../abis/StrategyABI';
import RewardTrackerAbi from '../../../../abis/arbitrum/RewardTracker';
import DistributorAbi from '../../../../abis/arbitrum/Distributor';
import { fetchContract } from '../../../rpc/client';
import getApyBreakdown, { ApyBreakdownResult } from '../getApyBreakdown';

export interface GmxApysParams {
  pools: LpPool[];
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

  const res = await Promise.all([
    distributorContract.read.tokensPerInterval(),
    rewardTrackerContract.read.stakedAmounts([pool.strat]),
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

const getTotalStakedInUsd = async (params: GmxApysParams, pool): Promise<BigNumber> => {
  let staked: BigNumber = new BigNumber(0);
  if (pool.glp) {
    const strategy = fetchContract(pool.strat, StrategyABI, params.chainId);
    staked = new BigNumber((await strategy.read.balanceOf()).toString());
  } else {
    const stakedTrackerContract = fetchContract(pool.stakedTracker, RewardTrackerAbi, params.chainId);
    staked = new BigNumber(
      (await stakedTrackerContract.read.depositBalances([pool.strat, pool.address])).toString()
    );
  }
  const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return staked.times(stakedPrice).dividedBy(pool.decimals);
};
