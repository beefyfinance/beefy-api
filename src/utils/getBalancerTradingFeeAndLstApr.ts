import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'apy', component: 'balancer' });

type BalancerAprItem = {
  apr: number;
  rewardTokenAddress: string | null;
  rewardTokenSymbol: string | null;
  type: string;
};

type BalancerPoolApr = {
  address: string;
  dynamicData?: {
    aprItems?: BalancerAprItem[];
  };
};

type BalancerPoolsAprResponse = {
  data?: {
    poolGetPools?: BalancerPoolApr[];
  };
};

const getChainName = (chain: ChainId) => {
  switch (chain) {
    case 146:
      return 'SONIC';
    case 10:
      return 'OPTIMISM';
    case 1:
      return 'MAINNET';
    case 42161:
      return 'ARBITRUM';
    case 8453:
      return 'BASE';
    case 43114:
      return 'AVALANCHE';
    case 252:
      return 'FRAXTAL';
    case 34443:
      return 'MODE';
    case 137:
      return 'POLYGON';
    case 100:
      return 'GNOSIS';
    case 143:
      return 'MONAD';
  }
};

export const getBalTradingAndLstApr = async (chain: ChainId, poolAddresses: string[]) => {
  let tradingAprMap: Record<string, number> = {};
  // Keep order aligned with `poolAddresses` (index used downstream)
  let lstAprs = poolAddresses.map(() => new BigNumber(0));
  const api = 'https://api-v3.balancer.fi/graphql';

  const queryString = `query apr {
            poolGetPools (where: {chainIn: ${getChainName(chain)}, idIn: ${JSON.stringify(poolAddresses)}}) {
                address
                dynamicData {
                aprItems {
                    apr
                    rewardTokenAddress
                    rewardTokenSymbol
                    type
                    }
                }
            }
        }`;

  try {
    const data = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'apr',
        query: queryString,
        variables: { chainIn: `"${getChainName(chain)}"` },
      }),
    });

    // FIXME(unsafe-cast): unchecked response shape
    const responseData = (await data.json()) as BalancerPoolsAprResponse;

    const pools = responseData?.data?.poolGetPools || [];
    const byAddress = new Map<string, BalancerPoolApr>(pools.map(p => [p.address?.toLowerCase?.(), p]));

    poolAddresses.forEach((address, i) => {
      const key = address?.toLowerCase?.();
      const pool = key ? byAddress.get(key) : undefined;

      // Default 0 if pool missing/malformed
      let tradingApr = 0;
      let lstApr = new BigNumber(0);

      if (pool?.dynamicData?.aprItems && Array.isArray(pool.dynamicData.aprItems)) {
        if (process.env.DEBUG_BALANCER_APR === 'true') {
          const debugAddr = process.env.DEBUG_BALANCER_APR_POOL?.toLowerCase?.();
          if (!debugAddr || debugAddr === key) {
            logger.debug({ chain, pool: key, aprItems: pool.dynamicData.aprItems }, 'balancer apr items');
          }
        }

        pool.dynamicData.aprItems.forEach(aprItem => {
          if (aprItem.type === 'SWAP_FEE_24H') {
            tradingApr = aprItem.apr;
          } else if (aprItem.type === 'IB_YIELD') {
            // IB_YIELD = yield from interest-bearing / LST-like assets
            // NOTE: Merkl incentives are handled separately in APY breakdown as `merklApr`
            lstApr = lstApr.plus(aprItem.apr);
          }
        });
      }

      tradingAprMap[key] = tradingApr;
      lstAprs[i] = lstApr;
    });
  } catch (error) {
    logger.warn({ chain }, 'balancer trading fee and lst apr fetch failed');
  }

  return { tradingAprMap, lstAprs };
};
