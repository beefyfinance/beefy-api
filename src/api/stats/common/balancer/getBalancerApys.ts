import { getTotalStakedInUsd, getYearlyRewardsInUsd } from '../curve/getCurveApyData';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import { getBalTradingAndLstApr } from '../../../../utils/getBalancerTradingFeeAndLstApr';

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
  merkl?: boolean;
}

interface BalancerParams {
  chainId: number;
  client: ApolloClient<NormalizedCacheObject>;
  pools: Pool[];
  balancerVault: string;
  aaveDataProvider: string;
  log?: boolean;
}

type MerklValue = {
  dailyrewards: number;
  tvl: number;
};

const liquidityProviderFee = 0.0025;

export const getBalancerApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
  const pairAddresses = params.pools.map(pool => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(params.chainId, pairAddresses),
    getPoolApys(params),
  ]);

  return getApyBreakdown(
    params.pools,
    tradingAprs.tradingAprMap as Record<string, BigNumber>,
    farmApys,
    liquidityProviderFee,
    tradingAprs.lstAprs
  );
};

const getTradingFeeAprBalancer = async (chainId, pairAddresses) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async (params: BalancerParams) => {
  const apys = [];

  const poolApyCalls = params.pools.map((pool, i) => getPoolApy(pool, params));
  const poolApyResults = await Promise.all(poolApyCalls);

  poolApyResults.forEach(result => {
    apys.push(result);
  });

  return apys;
};

const getPoolApy = async (pool: Pool, params: BalancerParams) => {
  if (pool.status === 'eol') return new BigNumber(0);
  let rewardsApy: BigNumber = new BigNumber(0);
  if (pool.merkl) {
    let poolAprs = {};
    let chainId = params.chainId;
    let merklApi = `https://api.angle.money/v3/opportunity?chainId=${chainId}`;
    try {
      poolAprs = await fetch(merklApi).then(res => res.json());
    } catch (e) {
      console.error(`Failed to fetch Merkl APRs: ${chainId}`);
    }

    let merklPools = poolAprs;
    if (Object.keys(merklPools).length !== 0) {
      for (const [key, value] of Object.entries(merklPools)) {
        const typedValue = value as MerklValue;
        if (key.toLowerCase() === `1_${pool.address.toLowerCase()}`) {
          rewardsApy = new BigNumber((typedValue.dailyrewards * 365) / typedValue.tvl);
        }
      }
    }
    return rewardsApy;
  }

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params.chainId, pool),
    getTotalStakedInUsd(params.chainId, pool),
  ]);

  rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  if (params.log) {
    console.log(pool.name, rewardsApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  }

  return rewardsApy;
};
