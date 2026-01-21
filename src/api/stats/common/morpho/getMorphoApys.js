import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';

// Helper function to calculate APY breakdown
const calculateApyBreakdown = (apy, isV2, isSkim) => {
  if (isV2) {
    const lending = new BigNumber(apy?.avgApy || 0);
    const assetYield = new BigNumber(apy?.asset?.yield?.apr || 0);
    let trading = lending.plus(assetYield);
    const vault = new BigNumber(apy?.avgNetApy || 0).minus(trading);
    if (isSkim) trading = lending.times(0.905).plus(assetYield);
    return { vault, trading };
  } else {
    const lending = new BigNumber(apy?.state?.netApyWithoutRewards || 0);
    const assetYield = new BigNumber(apy?.asset?.yield?.apr || 0);
    let trading = lending.plus(assetYield);
    const vault = new BigNumber(apy?.state?.netApy || 0).minus(trading);
    if (isSkim) trading = lending.times(0.905).plus(assetYield);
    return { vault, trading };
  }
};

// Helper function to create GraphQL query
const createGraphQLQuery = (chainId, addresses, isV2) => {
  if (addresses.length === 0) return null;

  const entityName = isV2 ? 'vaultV2s' : 'vaults';
  const fields = isV2
    ? 'name address avgNetApy ( lookback: ONE_HOUR ) avgApy ( lookback: ONE_HOUR ) asset { yield { apr } }'
    : 'name address state { netApy netApyWithoutRewards } asset { yield { apr } }';

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

export const getMorphoApys = async (chainId, pools) => {
  // Separate pools and create address arrays
  const poolsV1 = pools.filter(p => !p.v2);
  const poolsV2 = pools.filter(p => p.v2);
  const vaultsV1 = poolsV1.map(p => p.address);
  const vaultsV2 = poolsV2.map(p => p.address);

  // Create GraphQL queries
  const queryV1 = createGraphQLQuery(chainId, vaultsV1, false);
  const queryV2 = createGraphQLQuery(chainId, vaultsV2, true);

  // Execute API calls concurrently
  const apiCalls = [];
  if (queryV1) {
    apiCalls.push(
      fetch('https://api.morpho.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryV1),
      })
        .then(r => r.json())
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
        .then(r => r.json())
        .catch(() => ({ data: { vaultV2s: { items: [] } } }))
    );
  }

  let apysV1 = [];
  let apysV2 = [];

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
    console.error('Morpho apy error', chainId, err.message);
  }

  // Create lookup maps for O(1) access instead of O(n) array.find
  const apyMapV1 = new Map(apysV1.map(apy => [apy.address, apy]));
  const apyMapV2 = new Map(apysV2.map(apy => [apy.address, apy]));

  // Process pools and calculate APY breakdown
  return getApyBreakdown(
    pools.map(pool => {
      const apy = pool.v2 ? apyMapV2.get(pool.address) : apyMapV1.get(pool.address);
      const { vault, trading } = calculateApyBreakdown(apy, pool.v2, pool.skim);

      return {
        vaultId: pool.name,
        vault,
        trading,
      };
    })
  );
};
