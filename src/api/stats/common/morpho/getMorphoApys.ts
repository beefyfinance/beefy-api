import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { getApyBreakdown } from '../getApyBreakdownNew.ts';

const logger = getLoggerFor({ module: 'apy', platform: 'morpho' });

export type MorphoPool = {
  name: string;
  address: string;
  v2?: boolean;
};

type MorphoVaultApy = {
  address: string;
  avgNetApy?: number;
  avgNetApyExcludingRewards?: number;
  state?: {
    avgNetApy?: number;
    avgNetApyExcludingRewards?: number;
  };
  asset?: {
    yield?: {
      apr?: number;
    };
  };
};

type MorphoApiResponse = {
  data?: {
    vaults?: { items?: MorphoVaultApy[] };
    vaultV2s?: { items?: MorphoVaultApy[] };
  };
};

type MorphoGraphQLQuery = {
  query: string;
};

// Helper function to calculate APY breakdown
const calculateApyBreakdown = (apy: MorphoVaultApy | undefined, isV2: boolean | undefined) => {
  if (isV2) {
    const lending = new BigNumber(apy?.avgNetApyExcludingRewards || 0);
    const assetYield = new BigNumber(apy?.asset?.yield?.apr || 0);
    const trading = lending.plus(assetYield);
    const vault = new BigNumber(apy?.avgNetApy || 0).minus(lending);
    return { vault, trading };
  } else {
    const lending = new BigNumber(apy?.state?.avgNetApyExcludingRewards || 0);
    const assetYield = new BigNumber(apy?.asset?.yield?.apr || 0);
    const trading = lending.plus(assetYield);
    const vault = new BigNumber(apy?.state?.avgNetApy || 0).minus(lending);
    return { vault, trading };
  }
};

// Helper function to create GraphQL query
const createGraphQLQuery = (chainId: ChainId, addresses: string[], isV2: boolean): MorphoGraphQLQuery | null => {
  if (addresses.length === 0) return null;

  const entityName = isV2 ? 'vaultV2s' : 'vaults';
  const fields = isV2
    ? 'name address avgNetApy ( lookback: ONE_HOUR ) avgNetApyExcludingRewards ( lookback: ONE_HOUR ) asset { yield { apr } }'
    : 'name address state { avgNetApy avgNetApyExcludingRewards } asset { yield { apr } }';

  return {
    query: `{
      ${entityName}(where: { chainId_in: [${chainId}], address_in: ${JSON.stringify(addresses)} }) {
        items {
          ${fields}
        }
      }
    }`,
  };
};

export const getMorphoApys = async (chainId: ChainId, pools: MorphoPool[]) => {
  // Separate pools and create address arrays
  const poolsV1 = pools.filter(p => !p.v2);
  const poolsV2 = pools.filter(p => p.v2);
  const vaultsV1 = poolsV1.map(p => p.address);
  const vaultsV2 = poolsV2.map(p => p.address);

  // Create GraphQL queries
  const queryV1 = createGraphQLQuery(chainId, vaultsV1, false);
  const queryV2 = createGraphQLQuery(chainId, vaultsV2, true);

  // Execute API calls concurrently
  const apiCalls: Promise<MorphoApiResponse>[] = [];
  if (queryV1) {
    apiCalls.push(
      fetch('https://api.morpho.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryV1),
      })
        .then(r => r.json() as Promise<MorphoApiResponse>)
        .catch(() => ({ data: { vaults: { items: [] } } }))
    );
  }
  if (queryV2) {
    apiCalls.push(
      fetch('https://api.morpho.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryV2),
      })
        .then(r => r.json() as Promise<MorphoApiResponse>)
        .catch(() => ({ data: { vaultV2s: { items: [] } } }))
    );
  }

  let apysV1: MorphoVaultApy[] = [];
  let apysV2: MorphoVaultApy[] = [];

  try {
    const results = await Promise.all(apiCalls);

    if (queryV1) {
      apysV1 = results[0]?.data?.vaults?.items || [];
      if (queryV2) {
        apysV2 = results[1]?.data?.vaultV2s?.items || [];
      }
    } else if (queryV2) {
      apysV2 = results[0]?.data?.vaultV2s?.items || [];
    }
  } catch (err) {
    logger.warn({ err, chain: chainId }, 'apy fetch failed');
  }

  // Create lookup maps for O(1) access instead of O(n) array.find
  const apyMapV1 = new Map(apysV1.map((apy): [string, MorphoVaultApy] => [apy.address, apy]));
  const apyMapV2 = new Map(apysV2.map((apy): [string, MorphoVaultApy] => [apy.address, apy]));

  // Process pools and calculate APY breakdown
  return getApyBreakdown(
    pools.map(pool => {
      const apy = pool.v2 ? apyMapV2.get(pool.address) : apyMapV1.get(pool.address);
      const { vault, trading } = calculateApyBreakdown(apy, pool.v2);

      return {
        vaultId: pool.name,
        vault,
        lending: trading,
      };
    })
  );
};
