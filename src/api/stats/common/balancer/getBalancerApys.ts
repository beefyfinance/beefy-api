import { getTotalStakedInUsd, getYearlyRewardsInUsd } from './balancerUtils';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import { getBalTradingAndLstApr } from '../../../../utils/getBalancerTradingFeeAndLstApr';
import { getMerklAprByExplorerAddress } from '../../../offchain-rewards/providers/merkl/proxyClient';

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
  aaveDataProvider?: string;
  log?: boolean;
}

const liquidityProviderFee = 0.0025;

export const getBalancerApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
  const pairAddresses = params.pools.map(pool => pool.address);

  const [tradingAprs, poolApys] = await Promise.all([
    getTradingFeeAprBalancer(params.chainId, pairAddresses),
    getPoolApys(params),
  ]);

  return getApyBreakdown(
    params.pools,
    tradingAprs.tradingAprMap as Record<string, BigNumber>,
    poolApys.farmAprs,
    liquidityProviderFee,
    tradingAprs.lstAprs,
    undefined,
    undefined,
    poolApys.merklAprs
  );
};

const getTradingFeeAprBalancer = async (chainId, pairAddresses) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async (params: BalancerParams) => {
  const merklPools = params.pools.filter(pool => pool.merkl);
  const merklAprByAddress =
    merklPools.length > 0
      ? await getMerklV4AprByExplorerAddress(
          params.chainId,
          merklPools.map(p => p.address)
        )
      : {};

  const farmAprs: BigNumber[] = [];
  const merklAprs: number[] = [];

  const poolApyCalls = params.pools.map(pool => getPoolApy(pool, params));
  const poolApyResults = await Promise.all(poolApyCalls);

  params.pools.forEach((pool, i) => {
    const addressKey = pool.address?.toLowerCase?.();
    const merklApr = pool.merkl && addressKey ? merklAprByAddress[addressKey] ?? 0 : 0;

    // Merkl is a distinct non-compoundable component in breakdowns.
    // Keep farm/vault APR at 0 for merkl pools.
    merklAprs[i] = merklApr;
    farmAprs[i] = pool.merkl ? new BigNumber(0) : poolApyResults[i] ?? new BigNumber(0);
  });

  return { farmAprs, merklAprs };
};

const getPoolApy = async (pool: Pool, params: BalancerParams) => {
  if (pool.status === 'eol') return new BigNumber(0);
  let rewardsApy: BigNumber = new BigNumber(0);

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

const getMerklV4AprByExplorerAddress = async (
  chainId: number,
  explorerAddresses: string[]
): Promise<Record<string, number>> => {
  if (explorerAddresses.length === 0) return {};
  try {
    return await getMerklAprByExplorerAddress(chainId, explorerAddresses);
  } catch (e) {
    console.error(`Failed to fetch Merkl APRs via proxy: ${chainId}`);
    return {};
  }
};
