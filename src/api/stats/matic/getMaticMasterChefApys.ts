import BigNumber from 'bignumber.js';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import fetchPrice from '../../../utils/fetchPrice';
import getBlockNumber from '../../../utils/getBlockNumber';
import { getTradingFeeAprSushi, getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { sushiPolyClient as sushiClient } from '../../../apollo/client';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import MasterChef from '../../../abis/MasterChef';
import { Abi } from 'viem';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

export interface MaticMasterChefApysParams {
  masterchef: string;
  masterchefAbi?: Abi;
  tokenPerBlock: string;
  hasMultiplier: boolean;
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
}

export const getMasterChefApys = async (
  masterchefParams: MaticMasterChefApysParams
): Promise<ApyBreakdownResult> => {
  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

  const liquidityProviderFee = masterchefParams.liquidityProviderFee ?? QUICK_LPF; // use quick if lpf is missing

  return getApyBreakdown(masterchefParams.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (params: MaticMasterChefApysParams) => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = client === sushiClient ? getTradingFeeAprSushi : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: MaticMasterChefApysParams): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const [{ multiplier, blockRewards, totalAllocPoint }, { balances, allocPoints }] =
    await Promise.all([getMasterChefData(params), getPoolsData(params)]);

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

    const secondsPerBlock = params.secondsPerBlock ?? 2;
    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(
        pool.name,
        apy.valueOf(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }

  return apys;
};

const getMasterChefData = async (params: MaticMasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, POLYGON_CHAIN_ID);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(POLYGON_CHAIN_ID);
    multiplier = new BigNumber(
      (await masterchefContract.read.getMultiplier([blockNum - 1, blockNum])).toString()
    );
  }
  const blockRewards = new BigNumber(
    (await masterchefContract.read[params.tokenPerBlock]()).toString()
  );
  const totalAllocPoint = new BigNumber(
    (await masterchefContract.read.totalAllocPoint()).toString()
  );
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async (params: MaticMasterChefApysParams) => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, POLYGON_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, POLYGON_CHAIN_ID);
    balanceCalls.push(
      tokenContract.read.balanceOf([(pool.strat ?? params.masterchef) as `0x${string}`])
    );
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const [balanceResults, allocPointResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v.toString()));
  const allocPoints: BigNumber[] = allocPointResults.map(
    v => new BigNumber(v[params.allocPointIndex ?? '1'].toString())
  );
  return { balances, allocPoints };
};

const chefAbi = (tokenPerBlock): Abi => {
  const cakeAbi = [
    ...MasterChef,
    {
      inputs: [],
      name: tokenPerBlock,
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  return cakeAbi;
};
