import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../curve/getCurveApyData';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import IAaveProtocolDataProvider from '../../../../abis/matic/AaveProtocolDataProvider';
import IBalancerVault from '../../../../abis/IBalancerVault';
import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { getTradingFeeAprBalancer } from '../../../../utils/getTradingFeeApr';
import fetchPrice from '../../../../utils/fetchPrice';
import { fetchContract } from '../../../rpc/client';

interface Token {
  newGauge?: boolean;
  oracle: string;
  oracleId?: string;
  decimals?: string;
}

interface Underlying {
  address: string;
  index: number;
}

interface Pool {
  name: string;
  address: string;
  tokens: Token[];
  beefyFee?: number;
  status?: string;
  lsIndex?: number;
  cmpIndex?: number;
  composable?: boolean;
  bptIndex?: number;
  vaultPoolId?: string;
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
  chainId: number;
  client: ApolloClient<NormalizedCacheObject>;
  pools: Pool[];
  balancerVault: string;
  aaveDataProvider: string;
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

export const getBalancerApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
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

  const { tokenQtys, aaveYields } = await getPoolsData(params);

  const poolApyCalls = params.pools.map((pool, i) =>
    getPoolApy(pool, params, tokenQtys[i], aaveYields[i])
  );
  const poolApyResults = await Promise.all(poolApyCalls);

  poolApyResults.forEach(result => {
    apys.push(result.rewardsApy);
    lsAprs.push(result.aprFixed);
    cmpAprs.push(result.composableApr);
  });

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
  aaveYield?: BigNumber
): Promise<FarmApy> => {
  if (pool.status === 'eol') return { rewardsApy: new BigNumber(0), aprFixed: 0, composableApr: 0 };
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params.chainId, pool),
    getTotalStakedInUsd(params.chainId, pool),
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

    let lsApr: number = 0;
    if (Array.isArray(pool.lsUrl)) {
      for (let i = 0; i < pool.lsUrl.length; i++) {
        let response: JSON;
        try {
          response = await fetch(pool.lsUrl[i]).then(res => res.json());
          lsApr = await jp.query(response, pool.dataPath[i]);
        } catch (e) {
          console.error(`Balancer: Liquid Staking URL Fetch Error ${pool.name}`);
        }

        pool.balancerChargesFee
          ? (aprFixed =
              aprFixed + (lsApr * qty[pool.lsIndex[i]].dividedBy(totalQty).toNumber()) / 100 / 2)
          : (aprFixed =
              aprFixed + (lsApr * qty[pool.lsIndex[i]].dividedBy(totalQty).toNumber()) / 100);
      }
    } else {
      let response: JSON;
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
  }

  let compApr = new BigNumber(0);
  if (pool.includesComposableAaveTokens) {
    let bbAaveApy: BigNumber = aaveYield;
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
      // console.log(pool.name, bbAaveApy.toNumber(), qty[pool.cmpIndex].toNumber(), totalQty.toNumber(), bbAaveApy.times(qty[pool.lsIndex]).dividedBy(totalQty))
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

const getComposableAaveYield = async (
  tokens: Underlying[],
  poolId: string,
  index: number,
  params: BalancerParams
): Promise<BigNumber> => {
  const balVault = fetchContract(params.balancerVault, IBalancerVault, params.chainId);

  const supplyRateCalls = tokens.map(t => {
    const dataProvider = fetchContract(
      params.aaveDataProvider,
      IAaveProtocolDataProvider,
      params.chainId
    );
    return dataProvider.read.getReserveData([t.address as `0x${string}`]);
  });
  const tokenQtyCall = balVault.read.getPoolTokens([poolId as `0x${string}`]);

  const [supplyRateResults, tokenQtyResult] = await Promise.all([
    Promise.all(supplyRateCalls),
    tokenQtyCall,
  ]);

  const rates = supplyRateResults.map(v => new BigNumber(v[5].toString()));
  const tokenQtys = tokenQtyResult[1];

  let qty: BigNumber[] = [];
  let totalQty: BigNumber = new BigNumber(0);
  for (let j = 0; j < tokenQtys.length; j++) {
    if (j != index) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys[j].toString()));
      qty.push(new BigNumber(tokenQtys[j].toString()));
    }
  }

  let apy: BigNumber = new BigNumber(0);

  for (let i = 0; i < tokens.length; i++) {
    const tokenApy: BigNumber = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy: BigNumber = tokenApy.times(qty[tokens[i].index]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    // console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }

  return apy;
};

const getPoolsData = async (params: BalancerParams) => {
  const balVault = fetchContract(params.balancerVault, IBalancerVault, params.chainId);
  const calls = params.pools.map(pool =>
    balVault.read.getPoolTokens([pool.vaultPoolId as `0x${string}`])
  );
  const aaveCalls: Promise<BigNumber>[] = params.pools.map(pool => {
    if (pool.includesComposableAaveTokens) {
      return getComposableAaveYield(pool.aaveUnderlying, pool.bbPoolId, pool.bbIndex, params);
    }
    return new Promise(resolve => resolve(new BigNumber(0)));
  });

  const res = await Promise.all([Promise.all(calls), Promise.all(aaveCalls)]);

  const tokenQtys = res[0].map(v => v['1'].map(v => new BigNumber(v.toString())));
  const aaveYields = res[1];
  return { tokenQtys, aaveYields };
};
