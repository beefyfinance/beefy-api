import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdown';

const AAVE_V4_GRAPHQL_URL = 'https://api.v4.aave.com/graphql';

export type AaveV4Pool = {
  name: string;
  token: string;
  wrapper: string;
  aaveTokenSymbol: string;
  aaveSpokeName?: string;
  merklType: string;
  merklIdentifier: string;
  oracle: string;
  oracleId: string;
  decimals: string;
};

export type AaveV4PoolData = {
  lendingApr: BigNumber;
  merklApr: BigNumber;
};

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
    supplyApy?: {
      normalized?: string;
    };
  };
};

type AaveV4GraphqlResponse = {
  data?: {
    reserves?: AaveV4Reserve[];
  };
  errors?: unknown;
};

type MerklOpportunity = {
  type?: string;
  identifier?: string;
  status?: string;
  apr?: number;
};

type MerklAprData = {
  apr: BigNumber;
};

export const getAaveV4ApyData = async (chainId: number, pools: AaveV4Pool[]) => {
  const data = await getAaveV4PoolData(chainId, pools);

  return getApyBreakdown(
    pools.map(pool => ({ ...pool, address: pool.name })),
    Object.fromEntries(pools.map((pool, i) => [pool.name, data[i].lendingApr])),
    data.map(item => item.merklApr)
  );
};

export const getAaveV4PoolData = async (chainId: number, pools: AaveV4Pool[]): Promise<AaveV4PoolData[]> => {
  const [aaveData, merklAprData] = await Promise.all([
    getAaveV4ReserveData(chainId, pools),
    getAaveV4MerklAprData(chainId, pools),
  ]);

  return pools.map((_, i) => ({
    lendingApr: aaveData[i],
    merklApr: merklAprData[i].apr,
  }));
};

const getAaveV4ReserveData = async (chainId: number, pools: AaveV4Pool[]): Promise<BigNumber[]> => {
  const reserves = await fetchAaveV4Reserves(chainId);

  return pools.map(pool => {
    const tokenReserves = reserves.filter(
      reserve => reserve.asset?.underlying?.info?.symbol?.toLowerCase() === pool.aaveTokenSymbol.toLowerCase()
    );
    const reserve = tokenReserves.find(reserve => reserve.spoke?.name === pool.aaveSpokeName) ?? tokenReserves[0];

    return new BigNumber(reserve?.summary?.supplyApy?.normalized || 0).div(100);
  });
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
        supplyApy {
          normalized
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
      console.error('Aave V4 GraphQL reserve error', response.errors);
      return [];
    }

    return response.data?.reserves || [];
  } catch (e) {
    console.error('Aave V4 GraphQL reserve fetch failed', e);
    return [];
  }
};

const getAaveV4MerklAprData = async (chainId: number, pools: AaveV4Pool[]): Promise<MerklAprData[]> => {
  return Promise.all(pools.map(pool => getMerklAprData(chainId, pool)));
};

const getMerklAprData = async (chainId: number, pool: AaveV4Pool): Promise<MerklAprData> => {
  try {
    const match = await getMerklOpportunity(chainId, pool.merklType, pool.merklIdentifier);

    if (!match || match.status !== 'LIVE') {
      return emptyMerklAprData();
    }

    return {
      apr: new BigNumber(match.apr || 0).div(100),
    };
  } catch (e) {
    console.error(`Aave V4 Merkl data error for ${pool.name}`, e);
    return emptyMerklAprData();
  }
};

const getMerklOpportunity = async (
  chainId: number,
  type: string,
  identifier: string
): Promise<MerklOpportunity | undefined> => {
  const encodedIdentifier = encodeURIComponent(identifier);
  const url = `https://api.merkl.xyz/v4/opportunities?chainId=${chainId}&identifier=${encodedIdentifier}`;
  const data = await fetch(url).then(res => res.json());

  if (!Array.isArray(data)) {
    return undefined;
  }

  return data.find(
    (opportunity: MerklOpportunity) =>
      opportunity.type === type &&
      typeof opportunity.identifier === 'string' &&
      opportunity.identifier.toLowerCase() === identifier.toLowerCase()
  );
};

const emptyMerklAprData = (): MerklAprData => ({
  apr: new BigNumber(0),
});
