import { MultiCall } from 'eth-multicall';
import Web3 from 'web3';
import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../common/curve/getCurveApyData';
import { getApyBreakdown, ApyBreakdownResult } from '../common/getApyBreakdown';
import { NormalizedCacheObject } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import jp from 'jsonpath';
import { getContractWithProvider } from '../../../utils/contractHelper';
import IAaveProtocolDataProvider from '../../../abis/matic/AaveProtocolDataProvider.json';
import IBalancerVault from '../../../abis/IBalancerVault.json';
import { multicallAddress } from '../../../utils/web3';
import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { getTradingFeeAprBalancer } from '../../../utils/getTradingFeeApr';
import fetchPrice from '../../../utils/fetchPrice';

interface Token {
  oracle: string;
  oracleId?: string;
  decimals?: string;
}

interface Underlying {
  address: string;
}

interface GetPoolTokensResponse {
  tokens: string[];
  balances: BigNumber[];
  lastChangeBlock: number;
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
  poolApr: BigNumber;
  lsApr: number;
  composableApr: BigNumber;
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
  const apys: BigNumber[] = [];
  const lsAprs: number[] = [];
  const cmpAprs: number[] = [];

  let promises = [];

  params.pools.forEach(pool => promises.push(getPoolApy(pool, params)));
  const values: FarmApy[] = await Promise.all(promises);
  values.forEach(item => {
    apys.push(item.poolApr);
    lsAprs.push(item.lsApr);
    cmpAprs.push(item.composableApr.toNumber());
  });

  return {
    poolAprs: apys,
    lsAprs: lsAprs,
    composableAprs: cmpAprs,
  };
};

const getPoolApy = async (pool: Pool, params: BalancerParams) => {
  if (pool.status === 'eol') return new BigNumber(0);
  let web3: Web3 = params.web3;

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(web3, new MultiCall(web3, multicallAddress(params.chainId)), pool),
    getTotalStakedInUsd(web3, pool),
  ]);

  let rewardsApy: BigNumber = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  let aprFixed: number = 0;
  if (pool.lsUrl) {
    const balVault = getContractWithProvider(IBalancerVault, params.balancerVault, web3);
    const tokenQtys: GetPoolTokensResponse = await balVault.methods
      .getPoolTokens(pool.vaultPoolId)
      .call();

    let qty: BigNumber[] = [];
    let totalQty: BigNumber = new BigNumber(0);
    for (let j = 0; j < tokenQtys.balances.length; j++) {
      if (pool.composable) {
        if (pool.bptIndex == j) {
          continue;
        }
      }

      const price: number = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt: BigNumber = new BigNumber(tokenQtys.balances[j])
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

  let composableApr: BigNumber = new BigNumber(0);
  if (pool.includesComposableAaveTokens) {
    let bbAaveApy: BigNumber = await getComposableAaveYield(
      pool.aaveUnderlying,
      pool.bbPoolId,
      pool.bbIndex,
      params
    );
    if (pool.composableSplit) {
      const balVault = getContractWithProvider(IBalancerVault, params.balancerVault, web3);
      const tokenQtys: GetPoolTokensResponse = await balVault.methods
        .getPoolTokens(pool.vaultPoolId)
        .call();

      let qty: BigNumber[] = [];
      let totalQty: BigNumber = new BigNumber(0);
      for (let j = 0; j < tokenQtys.balances.length; j++) {
        if (pool.composable) {
          if (pool.bptIndex == j) {
            continue;
          }
        }

        const price: number = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt: BigNumber = new BigNumber(tokenQtys.balances[j])
          .times(price)
          .dividedBy(pool.tokens[j].decimals);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }

      composableApr = bbAaveApy.times(qty[pool.lsIndex].dividedBy(totalQty));
    } else {
      composableApr = bbAaveApy;
    }
  }

  if (params.log) {
    console.log(
      pool.name,
      rewardsApy.toNumber(),
      totalStakedInUsd.valueOf(),
      yearlyRewardsInUsd.valueOf()
    );
  }

  return {
    poolApr: rewardsApy,
    lsApr: aprFixed,
    composableApr: composableApr,
  };
};

const getComposableAaveYield = async (
  tokens: Underlying[],
  poolId: string,
  index: number,
  params: BalancerParams
): Promise<BigNumber> => {
  let supplyRateCalls = [];
  const multicall = new MultiCall(params.web3, multicallAddress(params.chainId));

  tokens.forEach(t => {
    const dataProvider = getContractWithProvider(
      IAaveProtocolDataProvider,
      params.aaveDataProvider,
      params.web3
    );
    supplyRateCalls.push({ supplyRate: dataProvider.methods.getReserveData(t.address) });
  });

  const res = await multicall.all([supplyRateCalls]);

  const rates = res[0].map(v => new BigNumber(v.supplyRate[3]));

  const balVault = getContractWithProvider(IBalancerVault, params.balancerVault, params.web3);
  const tokenQtys: GetPoolTokensResponse = await balVault.methods.getPoolTokens(poolId).call();

  let qty: BigNumber[] = [];
  let totalQty: BigNumber = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (j != index) {
      totalQty = totalQty.plus(new BigNumber(tokenQtys.balances[j]));
      qty.push(new BigNumber(tokenQtys.balances[j]));
    }
  }

  let apy: BigNumber = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const tokenApy: BigNumber = new BigNumber(rates[i]).div(RAY_DECIMALS);
    const portionedApy: BigNumber = tokenApy.dividedBy(2).times(qty[i]).dividedBy(totalQty);
    apy = apy.plus(portionedApy);
    //console.log(bbaUSDTokens[i].address, portionedApy.toNumber());
  }
  return apy;
};
