import getApyBreakdown from '../common/getApyBreakdown';
const BigNumber = require('bignumber.js');
const { ETH_CHAIN_ID: chainId, ETH_CHAIN_ID } = require('../../../constants');
import { fetchPrice } from '../../../utils/fetchPrice';
import { addressBook } from '../../../../packages/address-book/src/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
import IBalancerVault from '../../../abis/IBalancerVault';
import IAaveProtocolDataProvider from '../../../abis/matic/AaveProtocolDataProvider';
import AuraToken from '../../../abis/ethereum/AuraToken';
import AuraBooster from '../../../abis/ethereum/AuraBooster';
import { fetchContract } from '../../rpc/client';
import jp from 'jsonpath';
import AuraGauge from '../../../abis/ethereum/AuraGauge';
import { getBalTradingAndLstApr } from '../../../utils/getBalancerTradingFeeAndLstApr';

const {
  ethereum: {
    tokens: { AURA, BAL },
    platforms: { balancer },
  },
} = addressBook;

const balancerPools = require('../../../data/ethereum/auraBalancerLpPools.json');
const balV3Pools = require('../../../data/ethereum/balancerV3pools.json');

const pools = [...balancerPools, ...balV3Pools];

const liquidityProviderFee = 0.0025;
const secondsInAYear = 31536000;
const REWARD_MULTIPLIER_DENOMINATOR = 10000;
const balVault = fetchContract(balancer.router, IBalancerVault, ETH_CHAIN_ID);

const getAuraApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(chainId, pairAddresses),
    getPoolApys(pools),
  ]);

  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  return getApyBreakdown(
    poolsMap,
    tradingAprs.tradingAprMap,
    farmApys,
    liquidityProviderFee,
    tradingAprs.lstAprs
  );
};

const getTradingFeeAprBalancer = async (chainId, pairAddresses) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async pools => {
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

const getPoolApy = async (pool, auraData, balance, rewardRate, finish, multiplier, extras) => {
  if (pool.status === 'eol') return new BigNumber(0);

  let [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(auraData, pool, rewardRate, finish, multiplier, extras),
    getTotalStakedInUsd(pool, balance),
  ]);

  // console.log(pool.name, yearlyRewardsInUsd.toString(), totalStakedInUsd.toString());

  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return rewardsApy;
};

const getYearlyRewardsInUsd = async (auraData, pool, rewardRate, finish, multiplier, extras) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
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
      if (extra.periodFinish < Date.now() / 1000) continue;
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

const getTotalStakedInUsd = async (pool, balance) => {
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return balance.multipliedBy(lpPrice).dividedBy('1e18');
};

const getPoolsData = async pools => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  const periodFinishCalls = [];
  const extraRewardInfo = [];
  const extraRewardRateCalls = [];
  const extraRewardPeriodFinishCalls = [];
  const multiplierCalls = [];
  const booster = fetchContract(addressBook.ethereum.platforms.aura.booster, AuraBooster, ETH_CHAIN_ID);
  pools.forEach(pool => {
    const gaugeContract = fetchContract(pool.gauge, AuraGauge, ETH_CHAIN_ID);
    balanceCalls.push(gaugeContract.read.totalSupply());
    rewardRateCalls.push(gaugeContract.read.rewardRate());
    periodFinishCalls.push(gaugeContract.read.periodFinish());
    multiplierCalls.push(booster.read.getRewardMultipliers([pool.gauge]));
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

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const finishes = res[2].map(v => new BigNumber(v.toString()));
  const multipliers = res[5].map(v => new BigNumber(v.toString()));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[3][i].toString()),
    periodFinish: new BigNumber(res[4][i].toString()),
  }));

  return { balances, rewardRates, finishes, multipliers, extras };
};

const getAuraData = async () => {
  const auraContract = fetchContract(AURA.address, AuraToken, ETH_CHAIN_ID);

  const [total, max, cliffs, totalCliff] = await Promise.all([
    auraContract.read.totalSupply().then(res => new BigNumber(res.toString())),
    auraContract.read.EMISSIONS_MAX_SUPPLY().then(res => new BigNumber(res.toString())),
    auraContract.read.reductionPerCliff().then(res => new BigNumber(res.toString())),
    auraContract.read.totalCliffs().then(res => new BigNumber(res.toString())),
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

module.exports = { getAuraApys, getAuraData };
