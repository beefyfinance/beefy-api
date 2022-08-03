import BigNumber from 'bignumber.js';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { MultiCall } from 'eth-multicall';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { multicallAddress } from '../../../utils/web3';
import { ChainId } from '../../../../packages/address-book/address-book';

import MasterChefAbi from '../../../abis/IMultiRewardMasterChef.json';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
import { isSushiClient, isBeetClient } from '../../../apollo/client';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import fetchPrice from '../../../utils/fetchPrice';
import getBlockNumber from '../../../utils/getBlockNumber';
import getBlockTime from '../../../utils/getBlockTime';
import { getEDecimals } from '../../../utils/getEDecimals';
import {
  getTradingFeeAprSushi,
  getTradingFeeAprBalancer,
  getTradingFeeApr,
} from '../../../utils/getTradingFeeApr';
import { getContract } from '../../../utils/contractHelper';

export interface MasterChefApysParams {
  web3: Web3;
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

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

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
      ? getTradingFeeAprSushi(client, pairAddresses, fee)
      : isBeetClient(client)
      ? getTradingFeeAprBalancer(client, pairAddresses, fee, params.chainId)
      : getTradingFeeApr(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: MasterChefApysParams): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const { balances, rewardTokens, rewardDecimals, rewardsPerSec } = await getPoolsData(params);
  const secondsPerBlock = params.secondsPerBlock ?? (await getBlockTime(params.chainId));

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    let poolRewardsInUsd = new BigNumber(0);
    for (let j = 0; j < rewardTokens[i].length; j++) {
      const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardTokens[i][j] });
      const rewardInUsd = new BigNumber(rewardsPerSec[i][j])
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
  const masterchefContract = getContract(MasterChefAbi, params.masterchef);
  const multicall = new MultiCall(params.web3 as any, multicallAddress(params.chainId));
  const chefCalls = [];
  params.pools.forEach(pool => {
    chefCalls.push({
      balance: masterchefContract.methods.poolTotalLp(pool.poolId),
      rewards: masterchefContract.methods.poolRewardsPerSec(pool.poolId),
    });
  });

  const res = await multicall.all([chefCalls]);

  const balances: BigNumber[] = res[0].map(v => new BigNumber(v.balance));
  const rewardTokens: string[] = res[0].map(v => v.rewards['1']);
  const rewardDecimals: number[] = res[0].map(v => v.rewards['2']);
  const rewardsPerSec: BigNumber[] = res[0].map(v => v.rewards['3']);
  return { balances, rewardTokens, rewardDecimals, rewardsPerSec };
};
