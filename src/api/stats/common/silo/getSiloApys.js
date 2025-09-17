import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';

export const getSiloApys = async (chainId, pools) => {
  const chainName = getChainName(chainId);

  // Create promises for all pool API calls
  const apiPromises = pools.map(async pool => {
    if (pool.v2) {
      try {
        const url = `https://v2.silo.finance/api/lending-market/${chainName}/${pool.vaultId}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Silo v2 API error for ${pool.address}:`, response.status);
          return { pool, data: null };
        }

        const data = await response.json();
        return { pool, data };
      } catch (err) {
        console.error(`Silo v2 API fetch error for ${pool.address}:`, err.message);
        return { pool, data: null };
      }
    } else {
      try {
        const url = `https://v2.silo.finance/api/detailed-vault/${chainName}-${pool.address}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Silo API error for ${pool.address}:`, response.status);
          return { pool, data: null };
        }

        const data = await response.json();
        return { pool, data };
      } catch (err) {
        console.error(`Silo API fetch error for ${pool.address}:`, err.message);
        return { pool, data: null };
      }
    }
  });

  // Wait for all API calls to complete
  const results = await Promise.all(apiPromises);

  return getApyBreakdown(
    results.map(({ pool, data }) => {
      if (!data) {
        return {
          vaultId: pool.name,
          vault: new BigNumber(0),
          trading: new BigNumber(0),
        };
      }

      if (pool.v2) {
        // Handle v2 API response structure
        const underlyingApy = new BigNumber(data.silo0.underlyingApy || 0).div(1e18);

        // Calculate cumulative APR from protectedRewards array
        let protectedRewardsApr = new BigNumber(0);
        if (data.silo0.protectedRewards && Array.isArray(data.silo0.protectedRewards)) {
          protectedRewardsApr = data.silo0.protectedRewards.reduce((total, reward) => {
            return total.plus(new BigNumber(reward.apr || 0).div(1e18));
          }, new BigNumber(0));
        }
        return {
          vaultId: pool.name,
          vault: protectedRewardsApr.isNegative() ? new BigNumber(0) : protectedRewardsApr,
          trading: underlyingApy.isNegative() ? new BigNumber(0) : underlyingApy,
        };
      } else {
        // Handle vault API response structure (existing logic)
        const totalApr = new BigNumber(data.supplyApr || 0).div(1e18);
        const baseApr = new BigNumber(data.supplyBaseApr || 0).div(1e18);

        const trading = baseApr;
        const vault = totalApr.minus(baseApr);

        return {
          vaultId: pool.name,
          vault: vault.isNegative() ? new BigNumber(0) : vault,
          trading: trading.isNegative() ? new BigNumber(0) : trading,
        };
      }
    })
  );
};

// Helper function to map chain IDs to chain names used by Silo API
const getChainName = chainId => {
  const chainMap = {
    1: 'ethereum',
    43114: 'avalanche',
    42161: 'arbitrum',
    10: 'optimism',
    8453: 'base',
    137: 'polygon',
  };

  return chainMap[chainId] || 'ethereum';
};
