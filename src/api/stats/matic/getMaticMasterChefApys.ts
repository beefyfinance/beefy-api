import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
import { MINUTELY_HPY, POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import fetchPrice from '../../../utils/fetchPrice';
import getBlockNumber from '../../../utils/getBlockNumber';
import getFarmWithTradingFeesApy from '../../../utils/getFarmWithTradingFeesApy';
import { getTradingFeeAprSushi, getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { sushiClient } from '../../../apollo/client';
import { compound } from '../../../utils/compound';
import { AbiItem } from 'web3-utils';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';

export interface MaticMasterChefApysParams {
  masterchef: string;
  masterchefAbi: AbiItem[];
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
  const { multiplier, blockRewards, totalAllocPoint } = await getMasterChefData(params);
  const { balances, allocPoints } = await getPoolsData(params);

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

    if (params.log) {
      console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }

  return apys;
};

const getMasterChefData = async (params: MaticMasterChefApysParams) => {
  const masterchefContract = new web3.eth.Contract(params.masterchefAbi, params.masterchef);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(POLYGON_CHAIN_ID);
    multiplier = new BigNumber(
      await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
    );
  }
  const blockRewards = new BigNumber(
    await masterchefContract.methods[params.tokenPerBlock]().call()
  );
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async (params: MaticMasterChefApysParams) => {
  const masterchefContract = new web3.eth.Contract(params.masterchefAbi, params.masterchef);
  const multicall = new MultiCall(web3 as any, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, pool.address) as unknown as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(params.masterchef),
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
