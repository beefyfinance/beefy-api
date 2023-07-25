import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../packages/address-book/types/chainid';

import fetchPrice from '../../../utils/fetchPrice';
import { getApyBreakdown } from './getApyBreakdown';
import { LpPool, SingleAssetPool } from '../../../types/LpPool';
import { fetchContract } from '../../rpc/client';

// trading apr
import { ONE_CHAIN_ID, SUSHI_LPF } from '../../../constants';
import {
  getTradingFeeAprSushi,
  getTradingFeeApr,
  getTradingFeeAprSushiTrident,
} from '../../../utils/getTradingFeeApr';
import { isSushiClient, isSushiTridentClient } from '../../../apollo/client';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';

// abis
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime';
import { Abi } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi';

const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

interface MiniChefApyParams {
  minichefConfig: {
    minichef: string; // address
    minichefAbi: Abi;
    outputOracleId: string; // i.e. SUSHI
    tokenPerSecondContractMethodName: `${string}PerSecond`;
  };
  rewarderConfig?: {
    // TODO: get this info from minichef rather than hardcoding it
    rewarder: string; // address
    rewarderTokenOracleId: string; // i.e. WMATIC
    // totalAllocPoint is non public
    // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
    // need to pass in same hardcoded value found here:
    // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
    rewarderTotalAllocPoint?: number;
  };
  pools: (LpPool | SingleAssetPool)[];
  tradingClient?: ApolloClient<NormalizedCacheObject>;
  quickGamma?: string;
  sushiClient?: boolean;
  liquidityProviderFee?: number;
  chainId: ChainId;
  log?: boolean;
}

export const getMiniChefApys = async (params: MiniChefApyParams) => {
  const { pools } = params;

  const [{ tradingAprs, fee }, farmApys] = await Promise.all([
    getTradingAprs(params),
    getFarmApys(params),
  ]);

  return getApyBreakdown(pools, tradingAprs, farmApys, fee);
};

const getTradingAprs = async (params: MiniChefApyParams) => {
  const { pools, tradingClient, liquidityProviderFee } = params;
  const pairAddresses = pools.map(pool => pool.address);
  let tradingAprs: Record<string, BigNumber> | undefined;
  let fee: number | undefined;

  if (tradingClient !== undefined) {
    fee = liquidityProviderFee !== undefined ? liquidityProviderFee : SUSHI_LPF;
    tradingAprs = (await isSushiClient(tradingClient))
      ? await getTradingFeeAprSushi(tradingClient, pairAddresses, fee)
      : (await isSushiTridentClient(tradingClient))
      ? await getTradingFeeAprSushiTrident(tradingClient, pairAddresses, fee)
      : await getTradingFeeApr(tradingClient, pairAddresses, fee);
  } else if (params.quickGamma) {
    try {
      tradingAprs = {};
      const response = await fetch(params.quickGamma).then(res => res.json());
      pools.forEach(p => {
        tradingAprs[p.address.toLowerCase()] = new BigNumber(
          response[p.address.toLowerCase()].returns.daily.feeApr
        );
      });
    } catch (e) {
      console.error(`Error getting gamma trading aprs`, e);
      tradingAprs = {};
    }
  } else {
    tradingAprs = {};
  }
  return { tradingAprs, fee };
};

const getFarmApys = async (params: MiniChefApyParams) => {
  const { pools, minichefConfig, rewarderConfig, chainId } = params;
  const apys = [];

  // minichef
  const minichefContract = fetchContract(
    minichefConfig.minichef,
    minichefConfig.minichefAbi,
    chainId
  );
  const miniChefTokenPerSecondCall = minichefContract.read[
    minichefConfig.tokenPerSecondContractMethodName
  ]() as Promise<BigInt>;
  const miniChefTotalAllocPointCall = minichefContract.read.totalAllocPoint() as Promise<BigInt>;
  const miniChefTokenPriceCall = fetchPrice({
    oracle,
    id: minichefConfig.outputOracleId,
  }) as Promise<BigInt>;
  const poolsDataCall = getPoolsData(params);

  const rewarderCall = getRewarderData(params);

  const [
    miniChefTokenPerSecondResult,
    miniChefTotalAllocPointResult,
    miniChefTokenPriceResult,
    {
      balances,
      allocPoints,
      rewardAllocPoints,
      extraRewardsTotalAllocPoints,
      extraRewardsAllocPoints,
      extraRewardsRewardsPerSecond,
    },
    { rewarderTokenPerSecond, rewarderTotalAllocPoint, rewarderTokenPrice },
  ] = await Promise.all([
    miniChefTokenPerSecondCall,
    miniChefTotalAllocPointCall,
    miniChefTokenPriceCall,
    poolsDataCall,
    rewarderCall,
  ]);

  const miniChefTokenPerSecond = new BigNumber(miniChefTokenPerSecondResult.toString());
  const miniChefTotalAllocPoint = new BigNumber(miniChefTotalAllocPointResult.toString());
  const miniChefTokenPrice = new BigNumber(miniChefTokenPriceResult.toString());

  let globalExtraRewardIndex = 0;
  // get apy for each pool
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    let totalYearlyRewardsInUsd: BigNumber = new BigNumber(0);

    // MiniChef rewards
    const miniChefPoolBlockRewards = miniChefTokenPerSecond
      .times(allocPoints[i])
      .dividedBy(miniChefTotalAllocPoint);
    const miniChefYearlyRewards = miniChefPoolBlockRewards
      .dividedBy(secondsPerBlock)
      .times(secondsPerYear);
    const miniChefYearlyRewardsInUsd = miniChefYearlyRewards
      .times(miniChefTokenPrice)
      .dividedBy(DECIMALS);
    totalYearlyRewardsInUsd = totalYearlyRewardsInUsd.plus(miniChefYearlyRewardsInUsd);

    // Rewarder rewards, if rewarder is set
    if (rewarderConfig) {
      const allocPoint = rewardAllocPoints[i];
      const nativeRewards = rewarderTokenPerSecond
        .times(allocPoint)
        .dividedBy(rewarderTotalAllocPoint);
      const yearlyNativeRewards = nativeRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
      const nativeRewardsInUsd = yearlyNativeRewards.times(rewarderTokenPrice).dividedBy(DECIMALS);
      totalYearlyRewardsInUsd = totalYearlyRewardsInUsd.plus(nativeRewardsInUsd);
    }

    if (pool.extraRewards) {
      let extraRewards: BigNumber = new BigNumber(0);
      for (const rewards of pool.extraRewards ?? []) {
        const totalAllocPoint = extraRewardsTotalAllocPoints[globalExtraRewardIndex];
        const allocPoint = extraRewardsAllocPoints[globalExtraRewardIndex];
        const rewardPerSecond = extraRewardsRewardsPerSecond[globalExtraRewardIndex];
        globalExtraRewardIndex++;

        const price = await fetchPrice({ oracle: 'tokens', id: rewards.oracleId });
        const reward = rewardPerSecond.times(allocPoint).dividedBy(totalAllocPoint);
        const rewardsPerYear = reward.dividedBy(secondsPerBlock).times(secondsPerYear);
        extraRewards = extraRewards.plus(rewardsPerYear.times(price).dividedBy(rewards.decimals));
      }
      totalYearlyRewardsInUsd = totalYearlyRewardsInUsd.plus(extraRewards);
    }

    const apy = totalYearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        totalYearlyRewardsInUsd.valueOf()
      );
    }
    apys.push(apy);
  }

  return apys;
};

const getRewarderData = async (params: MiniChefApyParams) => {
  const { rewarderConfig, chainId } = params;

  if (rewarderConfig) {
    const rewarderContract = fetchContract(
      rewarderConfig.rewarder,
      SushiComplexRewarderTime,
      chainId
    );
    const calls = [rewarderContract.read.rewardPerSecond()];
    if (rewarderConfig.rewarderTotalAllocPoint == undefined) {
      calls.push(rewarderContract.read.totalAllocPoint());
    } else {
      calls.push(new Promise(resolve => resolve(BigInt(rewarderConfig.rewarderTotalAllocPoint))));
    }
    calls.push(fetchPrice({ oracle, id: rewarderConfig.rewarderTokenOracleId }));
    const res = await Promise.all(calls);
    return {
      rewarderTokenPerSecond: new BigNumber(res[0].toString()),
      rewarderTotalAllocPoint: Number(res[1]),
      rewarderTokenPrice: Number(res[2]),
    };
  }
  return {
    rewarderTokenPerSecond: undefined,
    rewarderTokenPrice: undefined,
    rewarderTotalAllocPoint: undefined,
  };
};

const getPoolsData = async (params: MiniChefApyParams) => {
  const { pools, minichefConfig, rewarderConfig, chainId } = params;

  const minichefContract = fetchContract(
    minichefConfig.minichef,
    minichefConfig.minichefAbi,
    chainId
  );

  // rewarder, if rewarder is set
  let rewarderContract = rewarderConfig
    ? fetchContract(rewarderConfig.rewarder, SushiComplexRewarderTime, chainId)
    : undefined;

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  const extraRewardsAllocCalls = [];
  const extraRewardPoolInfoCalls = [];
  const extraRewardRewardsPerSecondCalls = [];

  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, chainId);
    balanceCalls.push(tokenContract.read.balanceOf([minichefConfig.minichef as `0x${string}`]));
    allocPointCalls.push(minichefContract.read.poolInfo([pool.poolId]));
    if (rewarderConfig && rewarderContract) {
      rewardAllocPointCalls.push(rewarderContract.read.poolInfo([BigInt(pool.poolId)]));
    }
    if (pool.extraRewards) {
      for (const rewards of pool.extraRewards ?? []) {
        const rewardContract = fetchContract(rewards.rewarder, SushiComplexRewarderTime, chainId);
        extraRewardsAllocCalls.push(rewardContract.read.totalAllocPoint());
        extraRewardPoolInfoCalls.push(rewardContract.read.poolInfo([BigInt(pool.poolId)]));
        extraRewardRewardsPerSecondCalls.push(rewardContract.read.rewardPerSecond());
      }
    }
  });

  const [
    balanceResults,
    allocPointResults,
    rewardAllocPointResults,
    extraRewardsAllocResults,
    extraRewardPoolInfoResults,
    extraRewardRewardsPerSecondResults,
  ] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewardAllocPointCalls),
    Promise.all(extraRewardsAllocCalls),
    Promise.all(extraRewardPoolInfoCalls),
    Promise.all(extraRewardRewardsPerSecondCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const allocPoints = allocPointResults.map(v => new BigNumber(v['2'].toString()));
  const rewardAllocPoints = rewarderConfig
    ? rewardAllocPointResults.map(v => new BigNumber(v['2'].toString()))
    : {};
  const extraRewardsTotalAllocPoints = extraRewardsAllocResults.map(
    v => new BigNumber(v.toString())
  );
  const extraRewardsAllocPoints = extraRewardPoolInfoResults.map(
    v => new BigNumber(v['2'].toString())
  );
  const extraRewardsRewardsPerSecond = extraRewardRewardsPerSecondResults.map(
    v => new BigNumber(v.toString())
  );
  return {
    balances,
    allocPoints,
    rewardAllocPoints,
    extraRewardsTotalAllocPoints,
    extraRewardsAllocPoints,
    extraRewardsRewardsPerSecond,
  };
};
