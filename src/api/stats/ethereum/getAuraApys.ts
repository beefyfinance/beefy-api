import { addressBook, type ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import AuraBooster from '../../../abis/ethereum/AuraBooster.ts';
import AuraGauge from '../../../abis/ethereum/AuraGauge.ts';
import AuraToken from '../../../abis/ethereum/AuraToken.ts';
import { ETH_CHAIN_ID as chainId, ETH_CHAIN_ID } from '../../../constants.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getBalTradingAndLstApr } from '../../../utils/getBalancerTradingFeeAndLstApr.ts';
import { getEDecimals } from '../../../utils/getEDecimals.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';
import { getMerklApys } from '../common/getMerklApys.ts';

const {
  ethereum: {
    tokens: { AURA, BAL },
  },
} = addressBook;

import balV3Pools from '../../../data/ethereum/balancerV3pools.json' with { type: 'json' };

const pools = [...balV3Pools].filter(p => !p.eol);

const liquidityProviderFee = 0.0025;
const secondsInAYear = 31536000;
const REWARD_MULTIPLIER_DENOMINATOR = 10000;

type AuraPoolReward = {
  rewardGauge: string;
  oracleId: string;
  decimals: string;
};

type AuraPool = {
  name: string;
  address: string;
  gauge: string;
  status?: string;
  rewards?: AuraPoolReward[];
};

type AuraExtraRewardInfo = {
  pool: string;
  oracleId: string;
  decimals: string;
};

type AuraExtraReward = AuraExtraRewardInfo & {
  rewardRate: BigNumber;
  periodFinish: BigNumber;
};

const getAuraApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);

  const [tradingAprs, farmApys, merklAprs] = await Promise.all([
    getTradingFeeAprBalancer(chainId, pairAddresses),
    getPoolApys(pools),
    getMerklApys(chainId, pools),
  ]);

  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  const farmApysWithMerkl = farmApys.map((farmApy, i) => farmApy.plus(merklAprs[i] || 0));
  return getApyBreakdown(
    poolsMap,
    tradingAprs.tradingAprMap,
    farmApysWithMerkl,
    liquidityProviderFee,
    tradingAprs.lstAprs
  );
};

const getTradingFeeAprBalancer = async (chainId: ChainId, pairAddresses: string[]) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async (pools: AuraPool[]) => {
  return pools.map(() => new BigNumber(0));

  const apys = [];

  const [auraData, { balances, rewardRates, finishes, multipliers, extras }] = await Promise.all([
    getAuraData(),
    getPoolsData(pools),
  ]);

  const data = await Promise.all(
    pools.map((pool, i) =>
      getPoolApy(pools[i], auraData, balances[i], rewardRates[i], finishes[i], multipliers[i], extras)
    )
  );
  data.forEach(d => {
    apys.push(d);
  });

  return apys;
};

const getPoolApy = async (
  pool: AuraPool,
  auraData: BigNumber[],
  balance: BigNumber,
  rewardRate: BigNumber,
  finish: BigNumber,
  multiplier: BigNumber,
  extras: AuraExtraReward[]
) => {
  if (pool.status === 'eol') return new BigNumber(0);

  let [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(auraData, pool, rewardRate, finish, multiplier, extras),
    getTotalStakedInUsd(pool, balance),
  ]);

  // console.log(pool.name, yearlyRewardsInUsd.toString(), totalStakedInUsd.toString());

  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return rewardsApy;
};

const getYearlyRewardsInUsd = async (
  auraData: BigNumber[],
  pool: AuraPool,
  rewardRate: BigNumber,
  finish: BigNumber,
  multiplier: BigNumber,
  extras: AuraExtraReward[]
) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  if (finish.gt(Date.now() / 1000)) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: 'BAL' });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy(getEDecimals(BAL.decimals));
    // console.log(pool.name, 'BAL', yearlyRewardsInUsd.toString(), balPrice.toString());
    let amount = yearlyRewards
      .times(auraData[0])
      .dividedBy(auraData[1])
      .times(multiplier)
      .dividedBy(REWARD_MULTIPLIER_DENOMINATOR);
    // e.g. amtTillMax = 5e25 - 1e25 = 4e25

    if (amount.gte(auraData[2])) {
      amount = auraData[2];
    }

    const auraPrice = await fetchPrice({ oracle: 'tokens', id: AURA.oracleId });
    const auraYearlyRewardsInUsd = amount.times(auraPrice).dividedBy(getEDecimals(AURA.decimals));

    // console.log(pool.name, yearlyRewardsInUsd.toString(), auraYearlyRewardsInUsd.toString());

    let extraRewardsInUsd = new BigNumber(0);
    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish.lt(Date.now() / 1000)) continue;
      const price = await fetchPrice({
        oracle: 'tokens',
        id: extra.oracleId,
      });
      const extraRewards = extra.rewardRate.times(secondsInAYear).times(price).div(extra.decimals);
      extraRewardsInUsd = extraRewardsInUsd.plus(extraRewards);
      // console.log(pool.name, extra.oracleId, extraRewards.valueOf());
    }

    // console.log(pool.name, yearlyRewardsInUsd.toString(), auraYearlyRewardsInUsd.toString(), extraRewardsInUsd.toString());

    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(auraYearlyRewardsInUsd).plus(extraRewardsInUsd);
  }

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (pool: AuraPool, balance: BigNumber) => {
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return balance.multipliedBy(lpPrice).dividedBy('1e18');
};

const getPoolsData = async (pools: AuraPool[]) => {
  const balanceCalls: Promise<bigint>[] = [];
  const rewardRateCalls: Promise<bigint>[] = [];
  const periodFinishCalls: Promise<bigint>[] = [];
  const extraRewardInfo: AuraExtraRewardInfo[] = [];
  const extraRewardRateCalls: Promise<bigint>[] = [];
  const extraRewardPeriodFinishCalls: Promise<bigint>[] = [];
  const multiplierCalls: Promise<bigint>[] = [];
  const booster = fetchContract(addressBook.ethereum.platforms.aura.booster, AuraBooster, ETH_CHAIN_ID);
  pools.forEach(pool => {
    const gaugeContract = fetchContract(pool.gauge, AuraGauge, ETH_CHAIN_ID);
    balanceCalls.push(gaugeContract.read.totalSupply());
    rewardRateCalls.push(gaugeContract.read.rewardRate());
    periodFinishCalls.push(gaugeContract.read.periodFinish());
    multiplierCalls.push(booster.read.getRewardMultipliers([pool.gauge as Address]));
    pool.rewards?.forEach(reward => {
      const virtualGauge = fetchContract(reward.rewardGauge, AuraGauge, ETH_CHAIN_ID);
      extraRewardInfo.push({
        pool: pool.name,
        oracleId: reward.oracleId,
        decimals: reward.decimals,
      });
      extraRewardRateCalls.push(virtualGauge.read.rewardRate());
      extraRewardPeriodFinishCalls.push(virtualGauge.read.periodFinish());
    });
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraRewardRateCalls),
    Promise.all(extraRewardPeriodFinishCalls),
    Promise.all(multiplierCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v));
  const rewardRates = res[1].map(v => new BigNumber(v));
  const finishes = res[2].map(v => new BigNumber(v));
  const multipliers = res[5].map(v => new BigNumber(v));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[3][i]),
    periodFinish: new BigNumber(res[4][i]),
  }));

  return { balances, rewardRates, finishes, multipliers, extras };
};

const getAuraData = async () => {
  const auraContract = fetchContract(AURA.address, AuraToken, ETH_CHAIN_ID);

  const [total, max, cliffs, totalCliff] = await Promise.all([
    auraContract.read.totalSupply().then(res => new BigNumber(res)),
    auraContract.read.EMISSIONS_MAX_SUPPLY().then(res => new BigNumber(res)),
    auraContract.read.reductionPerCliff().then(res => new BigNumber(res)),
    auraContract.read.totalCliffs().then(res => new BigNumber(res)),
  ]);

  let premint = new BigNumber('5e25');
  // console.log(total.toNumber(), premint.toNumber(), max.toNumber(), cliffs.toNumber(), totalCliff.toNumber())
  // e.g. emissionsMinted = 6e25 - 5e25 - 0 = 1e25;
  const emissionsMinted = total.minus(premint);
  // e.g. reductionPerCliff = 5e25 / 500 = 1e23
  // e.g. cliff = 1e25 / 1e23 = 100
  const cliff = emissionsMinted.dividedBy(cliffs);
  // e.g. (new) reduction = (500 - 100) * 2.5 + 700 = 1700;
  const reduction = totalCliff.minus(cliff).times(5).dividedBy(2).plus(700);
  // e.g. (new) amount = 1e19 * 1700 / 500 =  34e18;
  const amtTillMax = max.minus(emissionsMinted);

  return [reduction, totalCliff, amtTillMax];
};

export { getAuraApys, getAuraData };
