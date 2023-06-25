import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from './getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { LpPool } from '../../../types/LpPool';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import IStakingDualRewards from '../../../abis/StakingDualRewards';

export interface DualRewardPoolParams {
  pools: LpPool[];

  oracleIdA: string;
  oracleA: string;
  decimalsA: string;

  oracleB: string;
  oracleIdB: string;
  decimalsB: string;

  tokenAddress: string;
  decimals: string;

  chainId: number;

  tradingFeeInfoClient?: ApolloClient<NormalizedCacheObject>;
  liquidityProviderFee?: number;
  tradingAprs?: {
    [x: string]: any;
  };

  xTokenConfig?: {
    xTokenAddress: string;
    isXTokenAorB: 'A' | 'B';
  };

  log?: boolean;
}

export const getRewardPoolDualApys = async (params: DualRewardPoolParams) => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(params), getFarmApys(params)]);
  const liquidityProviderFee = params.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(params.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (params: DualRewardPoolParams) => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = isSushiClient(client) ? getTradingFeeAprSushi : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async (params: DualRewardPoolParams) => {
  const apys = [];
  let rewardATokenPrice = await fetchPrice({ oracle: params.oracleA, id: params.oracleIdA });
  let rewardBTokenPrice = await fetchPrice({ oracle: params.oracleB, id: params.oracleIdB });
  let decimalsA = params.decimalsA;
  let decimalsB = params.decimalsB;

  const [rewardTokenPrice2, { balances, rewardRatesA, rewardRatesB }] = await Promise.all([
    params.xTokenConfig
      ? params.xTokenConfig.isXTokenAorB == 'A'
        ? getXPrice(rewardATokenPrice, params)
        : getXPrice(rewardBTokenPrice, params)
      : Promise.resolve(null),
    getPoolsData(params),
  ]);

  if (params.xTokenConfig) {
    if (params.xTokenConfig.isXTokenAorB == 'A') {
      rewardATokenPrice = rewardTokenPrice2;
    } else {
      rewardBTokenPrice = rewardTokenPrice2;
    }
  }

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    if (pool['rewardB']) {
      let rewardB = pool['rewardB'];
      decimalsB = rewardB.decimals;
      rewardBTokenPrice = await fetchPrice({ oracle: rewardB.oracle, id: rewardB.oracleId });
    }

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewardsA = rewardRatesA[i].times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewardsA.times(rewardATokenPrice).dividedBy(decimalsA);

    const yearlyRewardsB = rewardRatesB[i].times(secondsPerYear);
    const yearlyRewardsBInUsd = yearlyRewardsB.times(rewardBTokenPrice).dividedBy(decimalsB);
    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

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

const getPoolsData = async (params: DualRewardPoolParams) => {
  const balanceCalls = [];
  const rewardRateACalls = [];
  const rewardRateBCalls = [];
  params.pools.forEach(pool => {
    const rewardPool = fetchContract(pool.rewardPool, IStakingDualRewards, params.chainId);
    balanceCalls.push(rewardPool.read.totalSupply());
    if (
      pool.name == 'quick-quick-tel' ||
      pool.name == 'quick-usdc-tel' ||
      pool.name == 'quick-weth-tel'
    ) {
      rewardRateACalls.push(rewardPool.read.rewardRateB());
      rewardRateBCalls.push(rewardPool.read.rewardRateA());
    } else {
      rewardRateACalls.push(rewardPool.read.rewardRateA());
      rewardRateBCalls.push(rewardPool.read.rewardRateB());
    }
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateACalls),
    Promise.all(rewardRateBCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRatesA = res[1].map(v => new BigNumber(v.toString()));
  const rewardRatesB = res[2].map(v => new BigNumber(v.toString()));
  return { balances, rewardRatesA, rewardRatesB };
};

const getXPrice = async (tokenPrice, params: DualRewardPoolParams) => {
  const tokenContract = fetchContract(params.tokenAddress, ERC20Abi, params.chainId);
  const xTokenContract = fetchContract(params.xTokenConfig.xTokenAddress, ERC20Abi, params.chainId);
  const [stakedInXPool, totalXSupply] = await Promise.all([
    tokenContract.read
      .balanceOf([params.xTokenConfig.xTokenAddress as `0x${string}`])
      .then(v => new BigNumber(v.toString())),
    xTokenContract.read.totalSupply().then(v => new BigNumber(v.toString())),
  ]);

  return stakedInXPool.times(tokenPrice).dividedBy(totalXSupply);
};
