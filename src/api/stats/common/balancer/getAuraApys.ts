import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import BigNumber from 'bignumber.js';
import { getTradingFeeAprBalancer } from '../../../../utils/getTradingFeeApr';
import { fetchPrice } from '../../../../utils/fetchPrice';
import IAaveProtocolDataProvider from '../../../../abis/matic/AaveProtocolDataProvider';
import IAuraMinter from '../../../../abis/IAuraMinter';
import { default as IAuraGauge } from '../../../../abis/ethereum/AuraGauge';
import IBalancerVault from '../../../../abis/IBalancerVault';
import { fetchContract } from '../../../rpc/client';
import { fetchDaiSavingsRate } from '../../../../utils/fetchDaiSavingsRate';

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
  lsIndex?: number | number[];
  cmpIndex?: number;
  composable?: boolean;
  bptIndex?: number;
  vaultPoolId?: number;
  lsUrl?: string | string[];
  dataPath?: string | string[];
  lsAprFactor?: number | number[];
  balancerChargesFee?: boolean;
  includesComposableAaveTokens?: boolean;
  aaveUnderlying?: Underlying[];
  bbPoolId?: string;
  bbIndex?: number;
  composableSplit?: boolean;
}

interface BalancerParams {
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

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(params.client, pairAddresses, liquidityProviderFee, params.chainId),
    getPoolApys(params),
  ]);

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
      const amt: BigNumber = tokenQtys[j].times(price).dividedBy(pool.tokens[j].decimals);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }

    //Normalize ls Data to always handle arrays
    const lsUrls = Array.isArray(pool.lsUrl) ? pool.lsUrl : [pool.lsUrl];
    const dataPaths = Array.isArray(pool.dataPath) ? pool.dataPath : [pool.dataPath];
    const lsIndexes = Array.isArray(pool.lsIndex) ? pool.lsIndex : [pool.lsIndex];
    //Coinbase's returned APR is already in %, we need to normalize it by multiplying by 100
    const lsAprFactors = pool.lsAprFactor
      ? Array.isArray(pool.lsAprFactor)
        ? pool.lsAprFactor
        : [pool.lsAprFactor]
      : [1];

    let lsApr: number = 0;
    try {
      const lsResponses: any[] = await Promise.all(
        lsUrls.map(url =>
          url === 'DSR'
            ? fetchDaiSavingsRate().then(res => res)
            : fetch(url).then(res => res.json())
        )
      );

      const lsAprs: number[] = lsResponses
        .map((res, i) => jp.query(res, dataPaths[i]))
        .map((apr, i) => apr * lsAprFactors[i]);
      lsApr = lsAprs.reduce((acum, cur) => acum + cur, 0);
      //console.log(pool.name, lsAprs, lsApr)
      lsAprs.forEach((apr, i) => {
        aprFixed +=
          (apr * qty[lsIndexes[i]].dividedBy(totalQty).toNumber()) /
          100 /
          (pool.balancerChargesFee ? 2 : 1);
      });
    } catch (err) {
      console.error(`Aura: Liquid Staking URL Fetch Error ${pool.name}`);
    }
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
        const amt: BigNumber = tokenQtys[j].times(price).dividedBy(pool.tokens[j].decimals);
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
  let auraYearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: 'BAL' });
    const auraPrice = await fetchPrice({ oracle: 'tokens', id: 'AURA' });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    const auraYearlyRewards = yearlyRewards.times(auraRate).dividedBy('1e18');
    auraYearlyRewardsInUsd = auraYearlyRewards.times(auraPrice).dividedBy('1e18');
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy('1e18');
  }
  // console.log(pool.name, yearlyRewardsInUsd.toString(), auraYearlyRewardsInUsd.toString());

  let extraRewardsInUsd = new BigNumber(0);
  for (const extra of extras.filter(e => e.pool === pool.name)) {
    if (extra.periodFinish < Date.now() / 1000) continue;
    const price = await fetchPrice({
      oracle: 'tokens',
      id: extra.oracleId,
    });
    extraRewardsInUsd = extraRewardsInUsd.plus(
      extra.rewardRate.times(secondsInAYear).times(price).div(extra.decimals)
    );
    //console.log(pool.name, extra.oracleId, extraRewardsInUsd.valueOf());
  }

  yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd).plus(auraYearlyRewardsInUsd);

  return yearlyRewardsInUsd;
};

const getComposableAaveYield = async (
  tokens: Underlying[],
  poolId: string,
  index: number,
  params: BalancerParams
): Promise<BigNumber> => {
  const supplyRateCalls = [];
  const tokenQtyCalls = [];

  const balVault = fetchContract(params.balancerVault, IBalancerVault, params.chainId);
  tokenQtyCalls.push(balVault.read.getPoolTokens([poolId as `0x${string}`]));

  tokens.forEach(t => {
    const dataProvider = fetchContract(
      params.aaveDataProvider,
      IAaveProtocolDataProvider,
      params.chainId
    );
    supplyRateCalls.push(dataProvider.read.getReserveData([t.address as `0x${string}`]));
    tokenQtyCalls.push(balVault.read.getPoolTokens([t.poolId as `0x${string}`]));
  });

  const [supplyRateResults, tokenQtyResults] = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(tokenQtyCalls),
  ]);

  const rates = supplyRateResults.map(v => new BigNumber(v[5].toString()));
  const tokenQtys = tokenQtyResults.map(v => v[1]);

  let apy: BigNumber = new BigNumber(0);
  let apys: BigNumber[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys[i + 1].length; j++) {
      if (j != tokens[i].bbIndex) {
        totalQty = totalQty.plus(new BigNumber(tokenQtys[i + 1][j].toString()));
        qty.push(new BigNumber(tokenQtys[i + 1][j].toString()));
      }
    }

    const tokenApy: BigNumber = rates[i].div(RAY_DECIMALS);
    const portionedApy: BigNumber = tokenApy.times(qty[tokens[i].index]).dividedBy(totalQty);
    apys.push(portionedApy);
    //  console.log(tokens[i].address, portionedApy.toNumber(), qty[tokens[i].index].toNumber(), totalQty.toNumber());
  }

  for (let i = 0; i < tokens.length; i++) {
    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys[0].length; j++) {
      if (j != index) {
        totalQty = totalQty.plus(new BigNumber(tokenQtys[0][j].toString()));
        qty.push(new BigNumber(tokenQtys[0][j].toString()));
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
  const calls = [];
  const gaugeSupplyCalls = [];
  const gaugeRateCalls = [];
  const gaugePeriodFinishCalls = [];
  const extraData = [];
  const extraRewardRateCalls = [];
  const extraRewardPeriodFinishCalls = [];
  const balVault = fetchContract(params.balancerVault, IBalancerVault, params.chainId);
  const auraMinter = fetchContract(params.auraMinter, IAuraMinter, params.chainId);

  params.pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, IAuraGauge, params.chainId);
    calls.push(balVault.read.getPoolTokens([pool.vaultPoolId]));

    gaugeSupplyCalls.push(gauge.read.totalSupply());
    gaugeRateCalls.push(gauge.read.rewardRate());
    gaugePeriodFinishCalls.push(gauge.read.periodFinish());

    pool.rewards?.forEach(reward => {
      const virtualGauge = fetchContract(reward.rewardGauge, IAuraGauge, params.chainId);
      extraData.push({ pool: pool.name, oracleId: reward.oracleId, decimals: reward.decimals });
      extraRewardRateCalls.push(virtualGauge.read.rewardRate());
      extraRewardPeriodFinishCalls.push(virtualGauge.read.periodFinish());
    });
  });

  const mintRateCall = auraMinter.read.mintRate();

  const res = await Promise.all([
    Promise.all(calls),
    Promise.all(gaugeSupplyCalls),
    Promise.all(gaugeRateCalls),
    Promise.all(gaugePeriodFinishCalls),
    Promise.all(extraRewardRateCalls),
    Promise.all(extraRewardPeriodFinishCalls),
    mintRateCall,
  ]);

  const tokenQtys: BigNumber[][] = res[0].map(v => v[1].map(z => new BigNumber(z.toString())));
  const balances = res[1].map(v => new BigNumber(v.toString()));
  const rewardRates = res[2].map(v => new BigNumber(v.toString()));
  const periodFinishes = res[3].map(v => Number(v));
  const extras = extraData.map((data, index) => ({
    ...data,
    rewardRate: new BigNumber(res[4][index].toString()),
    periodFinish: new BigNumber(res[5][index].toString()),
  }));

  const auraRate = new BigNumber(res[6].toString());

  return { tokenQtys, balances, rewardRates, periodFinishes, extras, auraRate };
};
