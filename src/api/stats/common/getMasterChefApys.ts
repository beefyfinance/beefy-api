import BigNumber from 'bignumber.js';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { MultiCall } from 'eth-multicall';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { multicallAddress } from '../../../utils/web3';
import { ChainId } from '../../../../packages/address-book/address-book';

import MasterChefAbi from '../../../abis/MasterChef.json';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
import { isSushiClient, isBeetClient } from '../../../apollo/client';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import fetchPrice from '../../../utils/fetchPrice';
import getBlockNumber from '../../../utils/getBlockNumber';
import getBlockTime from '../../../utils/getBlockTime';
import {
  getTradingFeeAprSushi,
  getTradingFeeAprBalancer,
  getTradingFeeApr,
} from '../../../utils/getTradingFeeApr';

export interface MasterChefApysParams {
  web3: Web3;
  chainId: ChainId;
  masterchef: string;
  masterchefAbi?: AbiItem[];
  tokenPerBlock: string;
  hasMultiplier: boolean;
  useTimestamp?: boolean;
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

export const getMasterChefApys = async (
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
    const getAprs = isSushiClient(client)
      ? getTradingFeeAprSushi
      : isBeetClient(client)
      ? getTradingFeeAprBalancer
      : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: MasterChefApysParams): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { multiplier, blockRewards, totalAllocPoint } = await getMasterChefData(params);
  const { balances, allocPoints } = await getPoolsData(params);

  const secondsPerBlock = params.secondsPerBlock ?? (await getBlockTime(params.chainId));
  if (params.log) {
    console.log(
      params.tokenPerBlock,
      blockRewards.div(params.decimals).toNumber(),
      'secondsPerBlock',
      secondsPerBlock,
      totalAllocPoint.toNumber()
    );
  }

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards
      .times(multiplier)
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(1 - (pool.depositFee ?? 0));

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

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

const getMasterChefData = async (params: MasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = new params.web3.eth.Contract(abi, params.masterchef);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(params.chainId);
    const period = params.useTimestamp
      ? (await params.web3.eth.getBlock(blockNum)).timestamp
      : blockNum;
    multiplier = new BigNumber(
      await masterchefContract.methods.getMultiplier(period - 1, period).call()
    );
  }
  const blockRewards = new BigNumber(
    await masterchefContract.methods[params.tokenPerBlock]().call()
  );
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async (params: MasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = new params.web3.eth.Contract(abi, params.masterchef);
  const multicall = new MultiCall(params.web3 as any, multicallAddress(params.chainId));
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach(pool => {
    const tokenContract = new params.web3.eth.Contract(ERC20_ABI, pool.address) as unknown as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? params.masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances: BigNumber[] = res[0].map(v => new BigNumber(v.balance));
  const allocPoints: BigNumber[] = res[1].map(v => v.allocPoint[params.allocPointIndex ?? '1']);
  return { balances, allocPoints };
};

const chefAbi = (tokenPerBlock): AbiItem[] => {
  const cakeAbi = MasterChefAbi as AbiItem[];
  cakeAbi.push({
    inputs: [],
    name: tokenPerBlock,
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  });
  return cakeAbi;
};
