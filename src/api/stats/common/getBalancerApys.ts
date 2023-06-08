import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import Web3 from 'web3';
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import { getApyBreakdown, ApyBreakdownResult } from '../common/getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import { getContract } from '../../../utils/contractHelper';
import IAaveProtocolDataProvider from '../../../abis/matic/AaveProtocolDataProvider.json';
import IBalancerVault from '../../../abis/IBalancerVault.json';
import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { getTradingFeeAprBalancer } from '../../../utils/getTradingFeeApr';
import fetchPrice from '../../../utils/fetchPrice';

interface Token {
  newGauge?: boolean;
  oracle: string;
  oracleId?: string;
  decimals?: string;
}

interface Underlying {
  address: string;
}

interface Pool {
  name: string;
  address: string;
  tokens: Token[];
  beefyFee?: number;
  status?: string;
  lsIndex?: number;
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

  const tokenQtys = await getPoolsData(params);

  for (let i = 0; i < params.pools.length; i++) {
    const { rewardsApy, aprFixed, composableApr } = await getPoolApy(
      params.pools[i],
      params,
      tokenQtys[i]
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
  tokenQtys: BigNumber[]
): Promise<FarmApy> => {
  if (pool.status === 'eol') return { rewardsApy: new BigNumber(0), aprFixed: 0, composableApr: 0 };
  let web3: Web3 = params.web3;

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(params.chainId)), pool),
    getTotalStakedInUsd(web3, pool),
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

      compApr = bbAaveApy.times(qty[pool.lsIndex]).dividedBy(totalQty);
      // console.log(pool.name, bbAaveApy, qty[pool.lsIndex], totalQty, bbAaveApy.times(qty[pool.lsIndex]).dividedBy(totalQty))
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
  let supplyRateCalls = [];
  let tokenQtyCalls = [];

  const multicall = new MultiCall(params.web3, multicallAddress(params.chainId));
  const balVault = getContract(IBalancerVault, params.balancerVault);

  tokens.forEach(t => {
    const dataProvider = getContract(IAaveProtocolDataProvider, params.aaveDataProvider);
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });
  });

  tokenQtyCalls.push({ tokenQty: balVault.methods.getPoolTokens(poolId) });

  const res = await multicall.all([supplyRateCalls, tokenQtyCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[5]));
  const tokenQtys = res[1].map(v => v.tokenQty['1']);

  let qty: BigNumber[] = [];
  let totalQty: BigNumber = new BigNumber(0);
  for (let j = 0; j < tokenQtys[0].length; j++) {
    if (j != index) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys[0][j]));
      qty.push(new BigNumber(tokenQtys[0][j]));
    }
  }

  let apy: BigNumber = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const tokenApy: BigNumber = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy: BigNumber = tokenApy.dividedBy(2).times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    // console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }

  return apy;
};

const getPoolsData = async params => {
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  let calls = [];
  const balVault = getContract(IBalancerVault, params.balancerVault);

  params.pools.forEach(pool => {
    calls.push({
      tokenQty: balVault.methods.getPoolTokens(pool.vaultPoolId),
    });
  });

  const res = await multicall.all([calls]);

  const tokenQtys = res[0].map(v => v.tokenQty['1']);

  return tokenQtys;
};
