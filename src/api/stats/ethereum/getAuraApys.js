import getApyBreakdown from '../common/getApyBreakdown';
const BigNumber = require('bignumber.js');
const { ETH_CHAIN_ID: chainId, ETH_CHAIN_ID } = require('../../../constants');
import { balancerClient } from '../../../apollo/client';
const fetchPrice = require('../../../utils/fetchPrice');

const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
import IBalancerVault from '../../../abis/IBalancerVault';
import IAaveProtocolDataProvider from '../../../abis/matic/AaveProtocolDataProvider';
import AuraToken from '../../../abis/ethereum/AuraToken';
import { fetchContract } from '../../rpc/client';
import jp from 'jsonpath';
import AuraGauge from '../../../abis/ethereum/AuraGauge';

const {
  ethereum: {
    tokens: { AURA, BAL, DAI, USDC, USDT },
    platforms: { balancer },
  },
} = addressBook;

const bbaUSDTokens = [
  {
    address: USDT.address,
  },
  {
    address: USDC.address,
  },
  {
    address: DAI.address,
  },
];

const pools = require('../../../data/ethereum/auraBalancerLpPools.json');
const aaveDataProvider = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d';
const eulerMarkets = '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3';
const bbaUSDPoolId = '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d';
const bbeUSDPoolId = '0x50cf90b954958480b8df7958a9e965752f62712400000000000000000000046f';

const liquidityProviderFee = 0.0025;
const secondsInAYear = 31536000;
const RAY_DECIMALS = '1e27';
const balVault = fetchContract(balancer.router, IBalancerVault, ETH_CHAIN_ID);

const getAuraApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(balancerClient, pairAddresses, liquidityProviderFee, chainId),
    getPoolApys(pools),
  ]);

  const poolsMap = pools.map(p => ({ name: p.name, address: p.address }));
  return getApyBreakdown(
    poolsMap,
    tradingAprs,
    farmApys[0],
    liquidityProviderFee,
    farmApys[1],
    farmApys[2]
  );
};

const getPoolApys = async pools => {
  const apys = [];
  const lsAprs = [];
  const cmpAprs = [];

  const [auraData, { balances, rewardRates, finishes, extras }] = await Promise.all([
    getAuraData(),
    getPoolsData(pools),
  ]);

  const data = await Promise.all(
    pools.map((pool, i) =>
      getPoolApy(pools[i], auraData, balances[i], rewardRates[i], finishes[i], extras)
    )
  );
  data.forEach(d => {
    apys.push(d[0]);
    lsAprs.push(d[1]);
    cmpAprs.push(d[2].toNumber());
  });

  return [apys, lsAprs, cmpAprs];
};

const getPoolApy = async (pool, auraData, balance, rewardRate, finish, extras) => {
  if (pool.status === 'eol') return new BigNumber(0);

  let [yearlyRewardsInUsd, totalStakedInUsd, aprFixed, bbaUSDApy] = await Promise.all([
    getYearlyRewardsInUsd(auraData, pool, rewardRate, finish, extras),
    getTotalStakedInUsd(pool, balance),
    pool.name == 'aura-wsteth-reth-sfrxeth-v3'
      ? getThreeEthPoolYield(pool)
      : pool.lsUrl
      ? getLiquidStakingPoolYield(pool)
      : 0,
    getComposableAaveYield(),
  ]);

  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  let composableApr = new BigNumber(0);
  if (pool.includesComposableStable) {
    pool.composableSplit
      ? (bbaUSDApy = bbaUSDApy.dividedBy(pool.composableSplit))
      : (bbaUSDApy = bbaUSDApy);
    composableApr = bbaUSDApy;
  }

  if (pool.name === 'aura-r-dai') {
    const a = 2;
  }

  // console.log(pool.name, bbaUSDApy.toNumber(), rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed, composableApr];
};

const getYearlyRewardsInUsd = async (auraData, pool, rewardRate, finish, extras) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: BAL.symbol });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy(getEDecimals(BAL.decimals));
    let amount = yearlyRewards.times(auraData[0]).dividedBy(auraData[1]);
    // e.g. amtTillMax = 5e25 - 1e25 = 4e25

    if (amount.gte(auraData[2])) {
      amount = auraData[2];
    }

    const auraPrice = await fetchPrice({ oracle: 'tokens', id: AURA.symbol });
    const auraYearlyRewardsInUsd = amount.times(auraPrice).dividedBy(getEDecimals(AURA.decimals));

    // console.log(pool.name, yearlyRewardsInUsd.toString(), auraYearlyRewardsInUsd.toString());

    let extraRewardsInUsd = new BigNumber(0);
    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const price = await fetchPrice({
        oracle: 'tokens',
        id: extra.oracleId,
      });
      extraRewardsInUsd = extra.rewardRate.times(secondsInAYear).times(price).div(extra.decimals);
      // console.log(pool.name, extra.oracleId, extraRewardsInUsd.valueOf());
    }

    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(auraYearlyRewardsInUsd).plus(extraRewardsInUsd);
  }

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (pool, balance) => {
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return balance.multipliedBy(lpPrice).dividedBy('1e18');
};

const getLiquidStakingPoolYield = async pool => {
  const tokenQtys = await balVault.read.getPoolTokens([pool.vaultPoolId]);

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys[1].length; j++) {
    if (pool.composable) {
      if (j != pool.bptIndex) {
        const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt = new BigNumber(tokenQtys[1][j].toString())
          .times(price)
          .dividedBy([pool.tokens[j].decimals]);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }
    } else {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys[1][j].toString())
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  let lsApr = 0;
  if (Array.isArray(pool.lsUrl)) {
    for (let i = 0; i < pool.lsUrl.length; i++) {
      let response;
      try {
        response = await fetch(pool.lsUrl[i]).then(res => res.json());
        lsApr = await jp.query(response, pool.dataPath[i]);
      } catch (e) {
        console.error(`Aura: Liquid Staking URL Fetch Error ${pool.name}`);
      }

      pool.balancerChargesFee
        ? (apr = apr + (lsApr * qty[pool.lsIndex[i]].dividedBy(totalQty).toNumber()) / 100 / 2)
        : (apr = apr + (lsApr * qty[pool.lsIndex[i]].dividedBy(totalQty).toNumber()) / 100);
    }
  } else {
    let response;
    try {
      response = await fetch(pool.lsUrl).then(res => res.json());
      lsApr = await jp.query(response, pool.dataPath);
    } catch (e) {
      console.error(`Aura: Liquid Staking URL Fetch Error ${pool.name}`);
    }

    pool.balancerChargesFee
      ? (apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
      : (apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
  }

  // console.log(pool.name, lsApr, apr);
  return apr;
};

const getThreeEthPoolYield = async pool => {
  const tokenQtys = await balVault.read.getPoolTokens([pool.vaultPoolId]);

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys[1].length; j++) {
    if (j != 0) {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys[1][j]).times(price).dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  try {
    const [wstEthResponse, sfrxEthResponse, rEthResponse] = await Promise.all([
      fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/sma').then(res => res.json()),
      fetch('https://api.frax.finance/v2/frxeth/summary/latest').then(res => res.json()),
      fetch('https://api.rocketpool.net/api/apr').then(res => res.json()),
    ]);

    const wstEthapr = wstEthResponse.data.smaApr;
    const sfrxEthapr = sfrxEthResponse.sfrxethApr;
    const rEthapr = rEthResponse.yearlyAPR;

    apr = apr + (wstEthapr / 2) * qty[0].dividedBy(totalQty).toNumber();
    apr = apr + (sfrxEthapr / 2) * qty[1].dividedBy(totalQty).toNumber();
    apr = apr + (rEthapr / 2) * qty[2].dividedBy(totalQty).toNumber();

    apr = apr / 100;
  } catch (err) {
    console.error(`Error fetching 3 ETH LS APR`);
  }
  // console.log(pool.name, apr);
  return apr;
};

const getComposableAaveYield = async () => {
  let supplyRateCalls = bbaUSDTokens.map(t => {
    const dataProvider = fetchContract(aaveDataProvider, IAaveProtocolDataProvider, ETH_CHAIN_ID);
    return dataProvider.read.getReserveData([t.address]);
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    balVault.read.getPoolTokens([bbaUSDPoolId]),
  ]);

  const rates = res[0].map(v => new BigNumber(v[3].toString()));
  const tokenQtys = await balVault.read.getPoolTokens([bbaUSDPoolId]);

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys[1].length; j++) {
    if (j != 2) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys[1][j].toString()));
      qty.push(new BigNumber(tokenQtys[1][j].toString()));
    }
  }

  let apy = new BigNumber(0);
  for (let i = 0; i < bbaUSDTokens.length; i++) {
    const tokenApy = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy = tokenApy.dividedBy(2).times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    // console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }
  return apy;
};

const getPoolsData = async pools => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  const periodFinishCalls = [];
  const extraRewardInfo = [];
  const extraRewardRateCalls = [];
  const extraRewardPeriodFinishCalls = [];
  pools.forEach(pool => {
    const gaugeContract = fetchContract(pool.gauge, AuraGauge, ETH_CHAIN_ID);
    balanceCalls.push(gaugeContract.read.totalSupply());
    rewardRateCalls.push(gaugeContract.read.rewardRate());
    periodFinishCalls.push(gaugeContract.read.periodFinish());
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
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const finishes = res[2].map(v => new BigNumber(v.toString()));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[3][i].toString()),
    periodFinish: new BigNumber(res[4][i].toString()),
  }));

  return { balances, rewardRates, finishes, extras };
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
