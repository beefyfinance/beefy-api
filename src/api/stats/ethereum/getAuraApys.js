import { MultiCall } from 'eth-multicall';
const fetch = require('node-fetch');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
import getApyBreakdown from '../common/getApyBreakdown';
const BigNumber = require('bignumber.js');

const IAuraToken = require('../../../abis/ethereum/AuraToken.json');
const IAuraGauge = require('../../../abis/ethereum/AuraGauge.json');
const IBalancerVault = require('../../../abis/IBalancerVault.json');
const IAaveProtocolDataProvider = require('../../../abis/matic/AaveProtocolDataProvider.json');
const IMarkets = require('../../../abis/ethereum/IMarkets.json');
import { multicallAddress } from '../../../utils/web3';
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
import { balancerClient } from '../../../apollo/client';
const fetchPrice = require('../../../utils/fetchPrice');

const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

const { getContractWithProvider, getContract } = require('../../../utils/contractHelper');
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
const multicall = new MultiCall(web3, multicallAddress(chainId));
const balVault = getContractWithProvider(IBalancerVault, balancer.router, web3);

const getAuraApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    balancerClient,
    pairAddresses,
    liquidityProviderFee,
    chainId
  );
  // console.log(tradingAprs);

  const farmApys = await getPoolApys(pools);
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

  const auraData = await getAuraData();
  const { balances, rewardRates, finishes, extras } = await getPoolsData(pools);

  for (let i = 0; i < pools.length; i++) {
    const data = await getPoolApy(
      pools[i],
      auraData,
      balances[i],
      rewardRates[i],
      finishes[i],
      extras
    );
    apys.push(data[0]);
    lsAprs.push(data[1]);
    cmpAprs.push(data[2].toNumber());
  }

  return [apys, lsAprs, cmpAprs];
};

const getPoolApy = async (pool, auraData, balance, rewardRate, finish, extras) => {
  if (pool.status === 'eol') return new BigNumber(0);

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(auraData, pool, rewardRate, finish, extras),
    getTotalStakedInUsd(pool, balance),
  ]);

  let aprFixed = 0;
  let rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  if (pool.name == 'aura-wsteth-reth-sfrxeth-v2') {
    aprFixed = await getThreeEthPoolYield(pool);
  } else if (pool.lidoUrl || pool.rocketUrl) {
    aprFixed = await getLiquidStakingPoolYield(pool);
  }

  let bbaUSDApy = await getComposableAaveYield();
  let bbeUSDApy = await getComposableEulerYield();
  let composableApr = new BigNumber(0);
  if (pool.includesComposableStable) {
    if (pool.composableStableOracle == 'bbeUSD') {
      pool.composableSplit
        ? (bbeUSDApy = bbeUSDApy.dividedBy(pool.composableSplit))
        : (bbeUSDApy = bbeUSDApy);
      composableApr = bbeUSDApy;
    } else {
      pool.composableSplit
        ? (bbaUSDApy = bbaUSDApy.dividedBy(pool.composableSplit))
        : (bbaUSDApy = bbaUSDApy);
      composableApr = bbaUSDApy;
    }
  }

  // console.log(pool.name, bbaUSDApy.toNumber(), rewardsApy.toNumber(),totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf());
  return [rewardsApy, aprFixed, composableApr];
};

const getYearlyRewardsInUsd = async (auraData, pool, rewardRate, finish, extras) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: BAL.symbol });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy(await getEDecimals(BAL.decimals));
    let amount = yearlyRewards.times(auraData[0]).dividedBy(auraData[1]);
    // e.g. amtTillMax = 5e25 - 1e25 = 4e25

    if (amount.gte(auraData[2])) {
      amount = auraData[2];
    }

    const auraPrice = await fetchPrice({ oracle: 'tokens', id: AURA.symbol });
    const auraYearlyRewardsInUsd = amount
      .times(auraPrice)
      .dividedBy(await getEDecimals(AURA.decimals));

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
  const tokenQtys = await balVault.methods.getPoolTokens(pool.vaultPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (pool.composable) {
      if (j != pool.bptIndex) {
        const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt = new BigNumber(tokenQtys.balances[j])
          .times(price)
          .dividedBy([pool.tokens[j].decimals]);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }
    } else {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys.balances[j])
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  try {
    const response = pool.lidoUrl
      ? await fetch(pool.lidoUrl).then(res => res.json())
      : await fetch(pool.rocketUrl).then(res => res.json());

    const lsApr = pool.lidoUrl ? response.data.steth : response.yearlyAPR;

    apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100;
    apr = pool.balancerChargesFee ? apr / 2 : apr;
  } catch (err) {
    console.error(`Error fetching ls yield for ${pool.name}`);
  }

  // console.log(pool.name, lsApr, apr);
  return apr;
};

const getThreeEthPoolYield = async pool => {
  const tokenQtys = await balVault.methods.getPoolTokens(pool.vaultPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != 0) {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys.balances[j])
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  try {
    const wstEthResponse = await fetch(pool.lidoUrl).then(res => res.json());
    const wstEthapr = wstEthResponse.data.steth;

    const sfrxEthResponse = await fetch('https://api.frax.finance/v2/frxeth/summary/latest').then(
      res => res.json()
    );
    const sfrxEthapr = sfrxEthResponse.sfrxethApr;

    const rEthResponse = await fetch('https://api.rocketpool.net/api/apr').then(res => res.json());
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
  let supplyRateCalls = [];

  bbaUSDTokens.forEach(t => {
    const dataProvider = getContractWithProvider(IAaveProtocolDataProvider, aaveDataProvider, web3);
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });
  });

  const res = await multicall.all([supplyRateCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[3]));
  const tokenQtys = await balVault.methods.getPoolTokens(bbaUSDPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != 2) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys.balances[j]));
      qty.push(new BigNumber(tokenQtys.balances[j]));
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

const getComposableEulerYield = async () => {
  let supplyRateCalls = [];

  bbaUSDTokens.forEach(t => {
    const marketsContract = getContractWithProvider(IMarkets, eulerMarkets, web3);
    supplyRateCalls.push({ supplyRate: marketsContract.methods.interestRate(t.address) });
  });

  const res = await multicall.all([supplyRateCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate));
  const tokenQtys = await balVault.methods.getPoolTokens(bbeUSDPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != 1) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys.balances[j]));
      qty.push(new BigNumber(tokenQtys.balances[j]));
    }
  }

  let apy = new BigNumber(0);
  for (let i = 0; i < bbaUSDTokens.length; i++) {
    const tokenApy = new BigNumber(rates[i]).div(RAY_DECIMALS).times(secondsInAYear);
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
  const extraRewardCalls = [];
  pools.forEach(pool => {
    const gaugeContract = getContract(IAuraGauge, pool.gauge);
    balanceCalls.push({
      balance: gaugeContract.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: gaugeContract.methods.rewardRate(),
    });
    periodFinishCalls.push({
      periodFinish: gaugeContract.methods.periodFinish(),
    });
    pool.rewards?.forEach(reward => {
      const virtualGauge = getContract(IAuraGauge, reward.rewardGauge);
      extraRewardCalls.push({
        pool: pool.name,
        oracleId: reward.oracleId,
        decimals: reward.decimals,
        rewardRate: virtualGauge.methods.rewardRate(),
        periodFinish: virtualGauge.methods.periodFinish(),
      });
    });
  });

  const res = await multicall.all([
    balanceCalls,
    rewardRateCalls,
    periodFinishCalls,
    extraRewardCalls,
  ]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const finishes = res[2].map(v => new BigNumber(v.periodFinish));
  const extras = res[3].map(v => ({
    ...v,
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }));

  return { balances, rewardRates, finishes, extras };
};

const getAuraData = async () => {
  const auraContract = getContractWithProvider(IAuraToken, AURA.address, web3);

  let totalSupplyCalls = [];
  let maxSupplyCalls = [];
  let reductionPerCliffCalls = [];
  let totalCliffsCalls = [];

  totalSupplyCalls.push({ totalSupply: auraContract.methods.totalSupply() });
  maxSupplyCalls.push({ maxSupply: auraContract.methods.EMISSIONS_MAX_SUPPLY() });
  reductionPerCliffCalls.push({ reductionPerCliff: auraContract.methods.reductionPerCliff() });
  totalCliffsCalls.push({ totalCliffs: auraContract.methods.totalCliffs() });

  const res = await multicall.all([
    totalSupplyCalls,
    maxSupplyCalls,
    reductionPerCliffCalls,
    totalCliffsCalls,
  ]);

  let total = new BigNumber(0);
  total = new BigNumber(res[0].map(v => v.totalSupply));
  const max = new BigNumber(res[1].map(v => v.maxSupply));
  const cliffs = new BigNumber(res[2].map(v => v.reductionPerCliff));
  const totalCliff = new BigNumber(res[3].map(v => v.totalCliffs));

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
