import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../curve/getCurveApyData';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import IAaveProtocolDataProvider from '../../../../abis/matic/AaveProtocolDataProvider';
import IBalancerVault from '../../../../abis/IBalancerVault';
import BigNumber from 'bignumber.js';
import { getTradingFeeAprBalancer } from '../../../../utils/getTradingFeeApr';
import { fetchPrice } from '../../../../utils/fetchPrice';
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
  poolId?: string;
  bbIndex?: number;
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
  lsAprFactor?: number | number[];
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

  const { tokenQtys } = await getPoolsData(params);

  const poolApyCalls = params.pools.map((pool, i) => getPoolApy(pool, params, tokenQtys[i]));
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
  tokenQtys: BigNumber[]
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

    const lsAprFactors = pool.lsAprFactor
      ? Array.isArray(pool.lsAprFactor)
        ? pool.lsAprFactor
        : [pool.lsAprFactor]
      : [1];

    let lsApr: number = 0;
    if (Array.isArray(pool.lsUrl)) {
      for (let i = 0; i < pool.lsUrl.length; i++) {
        let response: any;
        try {
          response = await fetch(pool.lsUrl[i]).then(res => res.json());
          lsApr = await jp.query(response, pool.dataPath[i]);
          lsApr = lsApr * lsAprFactors[i];
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
      let response: any;
      try {
        response = await fetch(pool.lsUrl).then(res => res.json());
        lsApr = await jp.query(response, pool.dataPath);
        lsApr = lsApr * lsAprFactors[0];
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

const getPoolsData = async (params: BalancerParams) => {
  const balVault = fetchContract(params.balancerVault, IBalancerVault, params.chainId);
  const calls = params.pools.map(pool =>
    balVault.read.getPoolTokens([pool.vaultPoolId as `0x${string}`])
  );

  const res = await Promise.all([Promise.all(calls)]);

  const tokenQtys = res[0].map(v => v['1'].map(v => new BigNumber(v.toString())));

  return { tokenQtys };
};
