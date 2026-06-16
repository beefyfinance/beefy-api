import BigNumber from 'bignumber.js';
import type { AaveV4Pool } from './getAaveV4Apys';

const AAVE_V4_GRAPHQL_URL = 'https://api.v4.aave.com/graphql';

type AaveV4Reserve = {
  spoke?: {
    name?: string;
  };
  asset?: {
    underlying?: {
      info?: {
        symbol?: string;
      };
    };
  };
  summary?: {
    supplied?: {
      amount?: {
        value?: string;
      };
    };
  };
};

type AaveV4GraphqlResponse = {
  data?: {
    reserves?: AaveV4Reserve[];
  };
  errors?: unknown;
};

export const getAaveV4Prices = async (chainId: number, pools: AaveV4Pool[], tokenPrices: Record<string, number>) => {
  const reserves = await fetchAaveV4Reserves(chainId);
  const prices = {};

  for (const pool of pools) {
    const price = tokenPrices[pool.oracleId] || 0;
    const totalSupply = getSuppliedAmount(pool, reserves).toString(10);

    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [],
      balances: [],
    };
  }

  return prices;
};

const getSuppliedAmount = (pool: AaveV4Pool, reserves: AaveV4Reserve[]): BigNumber => {
  const tokenReserves = reserves.filter(
    reserve => reserve.asset?.underlying?.info?.symbol?.toLowerCase() === pool.aaveTokenSymbol.toLowerCase()
  );
  const reserve = tokenReserves.find(reserve => reserve.spoke?.name === pool.aaveSpokeName) ?? tokenReserves[0];

  return new BigNumber(reserve?.summary?.supplied?.amount?.value || 0);
};

const fetchAaveV4Reserves = async (chainId: number): Promise<AaveV4Reserve[]> => {
  const query = `query Reserves {
    reserves(request: { query: { chainIds: [${chainId}] } }) {
      spoke {
        name
      }
      asset {
        underlying {
          info {
            symbol
          }
        }
      }
      summary {
        supplied {
          amount {
            value
          }
        }
      }
    }
  }`;

  try {
    const response: AaveV4GraphqlResponse = await fetch(AAVE_V4_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => res.json());

    if (response.errors) {
      console.error('Aave V4 GraphQL reserve price error', response.errors);
      return [];
    }

    return response.data?.reserves || [];
  } catch (e) {
    console.error('Aave V4 GraphQL reserve price fetch failed', e);
    return [];
  }
};
