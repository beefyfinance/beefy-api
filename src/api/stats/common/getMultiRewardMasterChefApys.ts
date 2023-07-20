import BigNumber from 'bignumber.js';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';

import { ChainId } from '../../../../packages/address-book/address-book';

import { isSushiClient, isBeetClient } from '../../../apollo/client';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import fetchPrice from '../../../utils/fetchPrice';
import getBlockTime from '../../../utils/getBlockTime';
import { getEDecimals } from '../../../utils/getEDecimals';
import {
  getTradingFeeAprSushi,
  getTradingFeeAprBalancer,
  getTradingFeeApr,
} from '../../../utils/getTradingFeeApr';
import IMultiRewardMasterChef from '../../../abis/IMultiRewardMasterChef';
import { fetchContract } from '../../rpc/client';

export interface MasterChefApysParams {
  chainId: ChainId;
  masterchef: string;
  singlePools?: SingleAssetPool[];
  pools?: LpPool[] | (LpPool | SingleAssetPool)[];
  oracle: string;
  oracleId: string;
  decimals: string;
  tradingFeeInfoClient?: ApolloClient<NormalizedCacheObject>;
  liquidityProviderFee?: number;
  log?: boolean;
  tradingAprs?: {
    [x: string]: any;
  };
  secondsPerBlock?: number;
  allocPointIndex?: string;
  burn?: number;
}

export const getMultiRewardMasterChefApys = async (
  masterchefParams: MasterChefApysParams
): Promise<ApyBreakdownResult> => {
  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingAprs(masterchefParams),
    getFarmApys(masterchefParams),
  ]);

  const liquidityProviderFee = masterchefParams.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(masterchefParams.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (params: MasterChefApysParams) => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const aprs = isSushiClient(client)
      ? await getTradingFeeAprSushi(client, pairAddresses, fee)
      : isBeetClient(client)
      ? await getTradingFeeAprBalancer(client, pairAddresses, fee, params.chainId)
      : await getTradingFeeApr(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: MasterChefApysParams): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const [{ balances, rewardTokens, rewardDecimals, rewardsPerSec }, secondsPerBlock] =
    await Promise.all([
      getPoolsData(params),
      params.secondsPerBlock ?? getBlockTime(params.chainId),
    ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    let poolRewardsInUsd = new BigNumber(0);
    for (let j = 0; j < rewardTokens[i].length; j++) {
      const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardTokens[i][j] });
      const rewardInUsd = new BigNumber(rewardsPerSec[i][j].toString())
        .dividedBy(getEDecimals(rewardDecimals[i][j]))
        .times(rewardPrice)
        .times(1 - (pool.depositFee ?? 0));
      poolRewardsInUsd = poolRewardsInUsd.plus(rewardInUsd);
    }

    const secondsPerYear = 31536000;
    let yearlyRewardsInUsd = poolRewardsInUsd.dividedBy(secondsPerBlock).times(secondsPerYear);

    if (params.burn) {
      yearlyRewardsInUsd = yearlyRewardsInUsd.times(1 - params.burn);
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

const getPoolsData = async (params: MasterChefApysParams) => {
  const masterchefContract = fetchContract(
    params.masterchef,
    IMultiRewardMasterChef,
    params.chainId
  );
  const balanceCalls = params.pools.map(p => masterchefContract.read.poolTotalLp([p.poolId]));
  const rewardsCalls = params.pools.map(p => masterchefContract.read.poolRewardsPerSec([p.poolId]));

  const [balanceResults, rewardResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardsCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v.toString()));
  const rewardTokens = rewardResults.map(v => v[1]);
  const rewardDecimals = rewardResults.map(v => v[2]);
  const rewardsPerSec = rewardResults.map(v => v[3]);
  return { balances, rewardTokens, rewardDecimals, rewardsPerSec };
};
