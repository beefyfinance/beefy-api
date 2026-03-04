import { getTotalStakedInUsd, getYearlyRewardsInUsd } from './balancerUtils';
import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import { NormalizedCacheObject, ApolloClient } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import { getBalTradingAndLstApr } from '../../../../utils/getBalancerTradingFeeAndLstApr';

type MerklOpportunityV4 = {
  identifier?: string;
  apr?: number; // percent, e.g. 50.41 = 50.41% APR
  tvl?: number;
  dailyRewards?: number;
};

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

const getMerklV4AprByExplorerAddress = async (chainId: number, explorerAddresses: string[]) => {
  const result: Record<string, number> = {};
  const batchSize = 8; // stay under Merkl's default 10 req/s rate limit

  for (let i = 0; i < explorerAddresses.length; i += batchSize) {
    const batch = explorerAddresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async address => {
        const url = `https://api.merkl.xyz/v4/opportunities?chainId=${chainId}&explorerAddress=${address}`;
        try {
          const data = (await fetch(url).then(res => res.json())) as unknown;
          if (!Array.isArray(data) || data.length === 0) {
            return 0;
          }

          const opportunities = data as MerklOpportunityV4[];
          const match =
            opportunities.find(
              o => typeof o?.identifier === 'string' && o.identifier.toLowerCase() === address.toLowerCase()
            ) ?? opportunities[0];

          if (typeof match?.apr === 'number' && Number.isFinite(match.apr)) {
            return match.apr / 100;
          }

          if (
            typeof match?.dailyRewards === 'number' &&
            Number.isFinite(match.dailyRewards) &&
            typeof match?.tvl === 'number' &&
            Number.isFinite(match.tvl) &&
            match.tvl > 0
          ) {
            return (match.dailyRewards * 365) / match.tvl;
          }

          return 0;
        } catch (e) {
          console.error(`Failed to fetch Merkl APRs (v4): ${chainId}`);
          return 0;
        }
      })
    );

    batch.forEach((address, idx) => {
      result[address.toLowerCase()] = batchResults[idx] ?? 0;
    });
  }

  return result;
};
