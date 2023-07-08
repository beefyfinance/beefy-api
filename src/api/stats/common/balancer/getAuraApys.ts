import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../../utils/web3';
import Web3 from 'web3';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import { getContract } from '../../../../utils/contractHelper';
import IAaveProtocolDataProvider from '../../../../abis/matic/AaveProtocolDataProvider.json';
import IAuraGauge from '../../../../abis/ethereum/AuraGauge.json';
import IBalancerVault from '../../../../abis/IBalancerVault.json';
import IAuraMinter from '../../../../abis/IAuraMinter.json';
import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { getTradingFeeAprBalancer } from '../../../../utils/getTradingFeeApr';
import fetchPrice from '../../../../utils/fetchPrice';

interface Token {
  newGauge?: boolean;
  oracle: string;
  oracleId?: string;
  decimals?: string;
}

interface Underlying {
  address: string;
  index: number;
  poolId?: string;
  bbIndex?: number;
}

interface Pool {
  name: string;
  address: string;
  gauge: string;
  tokens: Token[];
  beefyFee?: number;
  status?: string;
  lsIndex?: number;
  cmpIndex?: number;
  composable?: boolean;
  bptIndex?: number;
  vaultPoolId?: number;
  lsUrl?: string;
  dataPath?: string;
  balancerChargesFee?: boolean;
  includesComposableAaveTokens?: boolean;
  aaveUnderlying?: Underlying[];
  bbPoolId?: string;
  bbIndex?: number;
  composableSplit?: boolean;
}

interface BalancerParams {
  web3: Web3;
  chainId: number;
  client: ApolloClient<NormalizedCacheObject>;
  pools: Pool[];
  balancerVault: string;
  aaveDataProvider: string;
  auraMinter: string;
  log?: boolean;
}

interface FarmApyResult {
  poolAprs: BigNumber[];
  lsAprs: number[];
  composableAprs: number[];
}

interface FarmApy {
  rewardsApy: BigNumber;
  aprFixed: number;
  composableApr: number;
}

const liquidityProviderFee = 0.0025;
const RAY_DECIMALS = '1e27';
const secondsInAYear = 31536000;

export const getAuraApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
  const pairAddresses = params.pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    params.client,
    pairAddresses,
    liquidityProviderFee,
    params.chainId
  );

  // console.log(tradingAprs);

  const farmApys: FarmApyResult = await getPoolApys(params);

  return getApyBreakdown(
    params.pools,
    tradingAprs,
    farmApys.poolAprs,
    liquidityProviderFee,
    farmApys.lsAprs,
    farmApys.composableAprs
  );
};

const getPoolApys = async (params: BalancerParams): Promise<FarmApyResult> => {
  const apys = [];
  const lsAprs = [];
  const cmpAprs = [];

  const { tokenQtys, balances, rewardRates, periodFinishes, extras, auraRate } = await getPoolsData(
    params
  );

  for (let i = 0; i < params.pools.length; i++) {
    const { rewardsApy, aprFixed, composableApr } = await getPoolApy(
      params.pools[i],
      params,
      tokenQtys[i],
      balances[i],
      rewardRates[i],
      periodFinishes[i],
      extras,
      auraRate
    );

    apys.push(rewardsApy);
    lsAprs.push(aprFixed);
    cmpAprs.push(composableApr);
  }

  return {
    poolAprs: apys,
    lsAprs: lsAprs,
    composableAprs: cmpAprs,
  };
};

const getPoolApy = async (
  pool: Pool,
  params: BalancerParams,
  tokenQtys: BigNumber[],
  balance: BigNumber,
  rewardRate: BigNumber,
  finish: number,
  extras,
  auraRate
): Promise<FarmApy> => {
  if (pool.status === 'eol') return { rewardsApy: new BigNumber(0), aprFixed: 0, composableApr: 0 };

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool, rewardRate, finish, extras, auraRate),
    getTotalStakedInUsd(pool, balance),
  ]);

  let rewardsApy: BigNumber = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed: number = 0;

  if (pool.lsUrl) {
    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys.length; j++) {
      if (pool.composable) {
        if (pool.bptIndex == j) {
          continue;
        }
      }

      const price: number = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt: BigNumber = new BigNumber(tokenQtys[j])
        .times(price)
        .dividedBy(pool.tokens[j].decimals);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }

    let response: JSON;
    let lsApr: number = 0;
    try {
      response = await fetch(pool.lsUrl).then(res => res.json());
      lsApr = await jp.query(response, pool.dataPath);
    } catch (e) {
      console.error(`Balancer: Liquid Staking URL Fetch Error ${pool.name}`);
    }

    pool.balancerChargesFee
      ? (aprFixed = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100 / 2)
      : (aprFixed = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100);
  }

  let compApr = new BigNumber(0);
  if (pool.includesComposableAaveTokens) {
    let bbAaveApy: BigNumber = await getComposableAaveYield(
      pool.aaveUnderlying,
      pool.bbPoolId,
      pool.bbIndex,
      params
    );
    if (pool.composableSplit) {
      let qty: BigNumber[] = [];
      let totalQty: BigNumber = new BigNumber(0);
      for (let j = 0; j < tokenQtys.length; j++) {
        if (pool.composable) {
          if (pool.bptIndex == j) {
            continue;
          }
        }

        const price: number = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt: BigNumber = new BigNumber(tokenQtys[j])
          .times(price)
          .dividedBy(pool.tokens[j].decimals);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }

      compApr = bbAaveApy.times(qty[pool.cmpIndex]).dividedBy(totalQty);
      // console.log(pool.name, bbAaveApy, qty[pool.cmpIndex], totalQty, bbAaveApy.times(qty[pool.lsIndex]).dividedBy(totalQty))
    } else {
      compApr = bbAaveApy;
    }
  }

  let composableApr = compApr.toNumber();

  if (params.log) {
    console.log(
      pool.name,
      rewardsApy.toNumber(),
      totalStakedInUsd.valueOf(),
      yearlyRewardsInUsd.valueOf()
    );
  }

  return { rewardsApy, aprFixed, composableApr };
};

const getTotalStakedInUsd = async (pool, balance) => {
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return balance.multipliedBy(lpPrice).dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (pool, rewardRate, finish, extras, auraRate) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: 'BAL' });
    const auraPrice = await fetchPrice({ oracle: 'tokens', id: 'AURA' });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    const auraYearlyRewards = yearlyRewards.times(auraRate).dividedBy('1e18');
    const auraYearlyRewardsInUsd = auraYearlyRewards.times(auraPrice).dividedBy('1e18');
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy('1e18');

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

    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd).plus(auraYearlyRewardsInUsd);
  }

  return yearlyRewardsInUsd;
};

const getComposableAaveYield = async (
  tokens: Underlying[],
  poolId: string,
  index: number,
  params: BalancerParams
): Promise<BigNumber> => {
  let supplyRateCalls = [];
  let tokenQtyCalls = [];

  const multicall = new MultiCall(params.web3, multicallAddress(params.chainId));
  const balVault = getContract(IBalancerVault, params.balancerVault);

  tokenQtyCalls.push({ tokenQty: balVault.methods.getPoolTokens(poolId) });

  tokens.forEach(t => {
    const dataProvider = getContract(IAaveProtocolDataProvider, params.aaveDataProvider);
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });

    if (tokens.length > 1) {
      tokenQtyCalls.push({ tokenQty: balVault.methods.getPoolTokens(t.poolId) });
    }
  });

  const res = await multicall.all([supplyRateCalls, tokenQtyCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[5]));
  const tokenQtys = res[1].map(v => v.tokenQty['1']);

  let apy: BigNumber = new BigNumber(0);
  let apys: BigNumber[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys[i + 1].length; j++) {
      if (j != tokens[i].bbIndex) {
        totalQty = totalQty.plus(new BigNumber(tokenQtys[i + 1][j]));
        qty.push(new BigNumber(tokenQtys[i + 1][j]));
      }
    }

    const tokenApy: BigNumber = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy: BigNumber = tokenApy.times(qty[tokens[i].index]).dividedBy(totalQty);
    apys.push(portionedApy);
    //  console.log(tokens[i].address, portionedApy.toNumber(), qty[tokens[i].index].toNumber(), totalQty.toNumber());
  }

  for (let i = 0; i < tokens.length; i++) {
    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys[0].length; j++) {
      if (j != index) {
        totalQty = totalQty.plus(new BigNumber(tokenQtys[0][j]));
        qty.push(new BigNumber(tokenQtys[0][j]));
      }
    }

    const tokenApy: BigNumber = new BigNumber(apys[i]);
    const portionedApy: BigNumber = tokenApy.times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    //   console.log(tokens[i].address, portionedApy.toNumber(), qty[i].toNumber(), totalQty.toNumber());
  }

  return apy;
};

const getPoolsData = async params => {
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  let calls = [];
  let gaugeCalls = [];
  let extraRewardCalls = [];
  let mintRateCall = [];
  const balVault = getContract(IBalancerVault, params.balancerVault);
  const auraMinter = getContract(IAuraMinter, params.auraMinter);

  params.pools.forEach(pool => {
    const gauge = getContract(IAuraGauge, pool.gauge);
    calls.push({
      tokenQty: balVault.methods.getPoolTokens(pool.vaultPoolId),
    });

    gaugeCalls.push({
      balance: gauge.methods.totalSupply(),
      rewardRate: gauge.methods.rewardRate(),
      periodFinish: gauge.methods.periodFinish(),
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

  mintRateCall.push({
    mintRate: auraMinter.methods.mintRate(),
  });

  const res = await multicall.all([calls, gaugeCalls, extraRewardCalls, mintRateCall]);

  const tokenQtys = res[0].map(v => v.tokenQty['1']);
  const balances = res[1].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const periodFinishes = res[1].map(v => v.periodFinish);
  const extras = res[2].map(v => ({
    ...v,
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }));

  const auraRate = res[3].map(v => new BigNumber(v.mintRate));

  return { tokenQtys, balances, rewardRates, periodFinishes, extras, auraRate };
};
