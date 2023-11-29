import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../../utils/fetchPrice';
import { LpPool } from '../../../../types/LpPool';
import { ChainId } from '../../../../../packages/address-book/address-book';
import ERC20Abi from '../../../../abis/ERC20Abi';
import { fetchContract } from '../../../rpc/client';
import getApyBreakdown, { ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { getGmxTradingFeeApr } from '../../../../utils/getTradingFeeApr';

export interface GmxV2ApysParams {
  pools: LpPool[];
  tradingFeeInfoClient: ApolloClient<NormalizedCacheObject>;
  chainId: number;
  url: string;
  rewardId: string;
}

type ApiIncentivesResponse = {
  lp: {
    isActive: boolean;
    totalRewards: string;
    period: number;
    rewardsPerMarket: {
      [address: string]: string;
    };
  };
  migration: {
    isActive: boolean;
    maxRebateBps: number;
    period: number;
  };
  trading: {
    isActive: boolean;
    rebatePercent: number;
    allocation: string;
    period: number;
  };
};

export const getGmxV2CommonApys = async (params: GmxV2ApysParams): Promise<ApyBreakdownResult> => {
  let promises = [];
  let farmAprs: BigNumber[] = [];
  const tradingAprs = await getTradingApr(params);
  const incentives = await getIncentives(params.url);
  params.pools.forEach(pool => promises.push(getPoolApy(params, pool, incentives)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmAprs.push(item);
  }

  return getApyBreakdown(params.pools, tradingAprs, farmAprs, 0);
};

const getTradingApr = async (params: GmxV2ApysParams) => {
  const client = params.tradingFeeInfoClient;
  const marketAddresses = params.pools.map(pool => pool.address);
  const aprs = await getGmxTradingFeeApr(client, marketAddresses);
  return aprs;
};

const getIncentives = async url => {
  try {
    const incentives = await fetch(url).then(
      async res => (await res.json()) as ApiIncentivesResponse
    );
    return incentives.lp.rewardsPerMarket;
  } catch (err) {
    console.error('GMX APY error ', url);
  }
};

const getPoolApy = async (params, pool, incentives): Promise<BigNumber> => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool, incentives),
    getTotalStakedInUsd(params, pool),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (
  params: GmxV2ApysParams,
  pool,
  incentives
): Promise<BigNumber> => {
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: params.rewardId });
  let incentive = new BigNumber(0);
  if (incentives.hasOwnProperty(pool.address)) incentive = new BigNumber(incentives[pool.address]);
  return incentive.dividedBy('1e18').times(rewardPrice).dividedBy(7).times(365);
};

const getTotalStakedInUsd = async (params: GmxV2ApysParams, pool): Promise<BigNumber> => {
  const marketContract = fetchContract(pool.address, ERC20Abi, params.chainId);
  const staked = new BigNumber((await marketContract.read.totalSupply()).toString());
  const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return staked.times(stakedPrice).dividedBy('1e18');
};
