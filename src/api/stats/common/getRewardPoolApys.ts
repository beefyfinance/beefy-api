import type { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types.js';
import type { ApolloClient } from '@apollo/client/core/ApolloClient.js';
import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Abi, Address } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import InfraredGauge from '../../../abis/InfraredGauge.ts';
import IRewardPool from '../../../abis/IRewardPool.ts';
import IWrapper from '../../../abis/IWrapper.ts';
import { isSushiClient } from '../../../apollo/client.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import getBlockNumber from '../../../utils/getBlockNumber.ts';
import getBlockTime from '../../../utils/getBlockTime.ts';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';

const logger = getLoggerFor({ module: 'apy', platform: 'rewardPool' });

export type RewardPoolExtra = {
  rewardPool: string;
  rewardToken?: string;
  oracleId: string;
  decimals?: string;
  infrared?: boolean;
};

export type RewardPoolPool = {
  name: string;
  address: string;
  chainId?: ChainId;
  rewardPool?: string;
  gauge?: string;
  oracle?: string;
  oracleId?: string;
  decimals?: string;
  beefyFee?: number;
  extras?: RewardPoolExtra[];
};

export type RewardPoolApyParams = {
  chainId: ChainId;
  pools: RewardPoolPool[];
  oracle: string;
  oracleId: string;
  decimals: string;
  reward?: string;
  periodFinish?: string;
  liquidityProviderFee?: number;
  tradingAprs?: Record<string, BigNumber>;
  tradingFeeInfoClient?: ApolloClient<NormalizedCacheObject>;
  gammaClient?: string;
  isRewardInXToken?: boolean;
  tokenAddress?: string;
  xTokenAddress?: string;
  cake?: boolean;
  infrared?: boolean;
  log?: boolean;
};

type RewardPoolExtraData = {
  pool: string;
  token: string;
  decimals?: string;
};

type InfraredRewardData = readonly [Address, bigint, bigint, bigint, bigint, bigint, bigint];

type GammaFeeApiResponse = Record<string, { returns: { daily: { feeApr: number } } }>;

export const getRewardPoolApys = async (params: RewardPoolApyParams) => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(params), getFarmApys(params)]);

  const liquidityProviderFee = params.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(params.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async (params: RewardPoolApyParams) => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = isSushiClient(client) ? getTradingFeeAprSushi : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }

  if (params.gammaClient) {
    const response = await fetch(params.gammaClient).then(res => res.json() as Promise<GammaFeeApiResponse>);
    params.pools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(response[p.address.toLowerCase()].returns.daily.feeApr);
    });
  }
  return tradingAprs;
};

export const getFarmApys = async (params: RewardPoolApyParams) => {
  const apys: BigNumber[] = [];
  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const rewardTokenPriceCall = params.isRewardInXToken
    ? getXPrice(tokenPrice, params)
    : new Promise<number>(resolve => resolve(tokenPrice));

  const [rewardTokenPrice, { balances, rewardRates, periodFinishes, extras }] = await Promise.all([
    rewardTokenPriceCall,
    getPoolsData(params),
  ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const blockTime = params.periodFinish === 'periodInBlockFinish' ? await getBlockTime(params.chainId) : 0;
    const secondsPerYear = params.periodFinish === 'periodInBlockFinish' ? 31536000 / Number(blockTime) : 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);
    const block = params.periodFinish === 'periodInBlockFinish' ? await getBlockNumber(params.chainId) : 0;

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      const price = await fetchPrice({ oracle: 'tokens', id: extra.token });
      const extraRewardsInUsd = extra.rewardRate
        .times(secondsPerYear)
        .times(price)
        .div(extra.decimals || '1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
    }

    const isActive =
      params.periodFinish === 'periodInBlockFinish'
        ? periodFinishes[i].isGreaterThanOrEqualTo(block)
        : periodFinishes[i].isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000));

    const apy = isActive ? yearlyRewardsInUsd.dividedBy(totalStakedInUsd) : new BigNumber(0);
    apys.push(apy);

    if (params.log) {
      logger.debug(
        {
          pool: pool.name,
          apy: apy.toNumber(),
          tvl: totalStakedInUsd.valueOf(),
          yearlyUsd: yearlyRewardsInUsd.valueOf(),
          rewardPrice: rewardTokenPrice.valueOf(),
          rewardRate: rewardRates[i].valueOf(),
          periodFinish: periodFinishes[i].valueOf(),
        },
        'pool apy'
      );
    }
  }
  return apys;
};

export const getPoolsData = async (params: RewardPoolApyParams) => {
  const balanceCalls: Promise<unknown>[] = [];
  const rewardRateCalls: Promise<unknown>[] = [];
  const periodFinishCalls: Promise<unknown>[] = [];
  const extraCalls: Promise<unknown>[] = [];
  const extraData: RewardPoolExtraData[] = [];
  const periodFinish = params.periodFinish ?? 'periodFinish';
  const abi: Abi = params.periodFinish
    ? getAbi(periodFinish)
    : params.cake
      ? IWrapper
      : params.infrared
        ? InfraredGauge
        : IRewardPool;

  params.pools.forEach(pool => {
    const rewardPool = fetchContract(pool.rewardPool ? pool.rewardPool : (pool.gauge as string), abi, params.chainId);

    const stakedTokenContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    balanceCalls.push(
      params.cake ? stakedTokenContract.read.balanceOf([pool.gauge as Address]) : rewardPool.read.totalSupply()
    );
    rewardRateCalls.push(
      params.cake
        ? rewardPool.read.rewardPerSecond()
        : params.infrared
          ? rewardPool.read.rewardData([params.reward])
          : rewardPool.read.rewardRate()
    );
    periodFinishCalls.push(
      params.cake
        ? rewardPool.read.endTimestamp()
        : params.infrared
          ? rewardPool.read.rewardData([params.reward])
          : rewardPool.read[periodFinish]()
    );

    pool.extras?.forEach(extra => {
      const extraPool = fetchContract(extra.rewardPool, extra.infrared ? InfraredGauge : IWrapper, params.chainId);
      extraCalls.push(
        extra.infrared ? extraPool.read.rewardData([extra.rewardToken as Address]) : extraPool.read.rewardPerSecond()
      );
      extraData.push({ pool: pool.name, token: extra.oracleId });
    });
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v as bigint));
  const rewardRates = res[1].map(
    v => new BigNumber(params.infrared ? (v as InfraredRewardData)[3].toString() : (v as bigint).toString())
  );
  const periodFinishes = res[2].map(
    v => new BigNumber(params.infrared ? (v as InfraredRewardData)[2].toString() : (v as bigint).toString())
  );
  const extraRates = res[3].map(
    v => new BigNumber(params.infrared ? (v as InfraredRewardData)[3].toString() : (v as bigint).toString())
  );
  const extras = extraData.map((v, i) => ({ ...v, rewardRate: extraRates[i] }));

  return { balances, rewardRates, periodFinishes, extras };
};

const getXPrice = async (tokenPrice: number, params: RewardPoolApyParams) => {
  const tokenContract = fetchContract(params.tokenAddress as string, ERC20Abi, params.chainId);
  const xTokenContract = fetchContract(params.xTokenAddress as string, ERC20Abi, params.chainId);
  const [stakedInXPool, totalXSupply] = await Promise.all([
    tokenContract.read.balanceOf([params.xTokenAddress as Address]),
    xTokenContract.read.totalSupply(),
  ]);

  return new BigNumber(stakedInXPool).times(tokenPrice).dividedBy(totalXSupply);
};

const getAbi = (periodFinish: string): Abi => {
  return [
    ...IRewardPool,
    {
      inputs: [],
      name: periodFinish,
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
};
