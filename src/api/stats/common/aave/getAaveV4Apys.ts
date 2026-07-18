import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';
import { getLoggerFor } from '../../../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'apy', platform: 'aave' });

const AAVE_V4_GRAPHQL_URL = 'https://api.v4.aave.com/graphql';

export type AaveV4Pool = {
  name: string;
  spoke: string;
  reserveId: number;
  aaveTokenSymbol: string;
  aaveSpokeName?: string;
  identifier?: string;
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
  identifier?: string;
  apr?: number;
};

type MerklAprData = {
  apr: BigNumber;
};

export const getAaveV4ApyData = async (chainId: number, pools: AaveV4Pool[]) => {
  const data = await getAaveV4PoolData(chainId, pools);

  return getApyBreakdown(
    pools.map((pool, i) => ({
      vaultId: pool.name,
      lending: data[i].lendingApr,
      vault: data[i].merklApr,
    }))
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
      logger.warn({ err: response.errors, chain: chainId }, 'graphql reserve query errors');
      return [];
    }

    return response.data?.reserves || [];
  } catch (e) {
    logger.warn({ err: e, chain: chainId }, 'reserve fetch failed');
    return [];
  }
};

const getAaveV4MerklAprData = async (chainId: number, pools: AaveV4Pool[]): Promise<MerklAprData[]> => {
  let merklData: Record<string, number> = {};
  if (pools.some(pool => pool.identifier)) {
    merklData = await fetchAaveMerklAprs(chainId);
  }

  return pools.map(pool => ({
    apr: new BigNumber(pool.identifier ? merklData[pool.identifier] || 0 : 0).div(100),
  }));
};

const fetchAaveMerklAprs = async (chainId: number): Promise<Record<string, number>> => {
  try {
    const opportunities = await fetchAaveMerklOpportunities(chainId);
    return opportunities.reduce((acc, opportunity) => {
      if (typeof opportunity.identifier === 'string') {
        acc[opportunity.identifier] = opportunity.apr || 0;
      }
      return acc;
    }, {} as Record<string, number>);
  } catch (e) {
    logger.warn({ err: e, chain: chainId }, 'merkl apr fetch failed');
    return {};
  }
};

const fetchAaveMerklOpportunities = async (chainId: number): Promise<MerklOpportunity[]> => {
  const url = `https://api.merkl.xyz/v4/opportunities?chainId=${chainId}&mainProtocolId=aave`;
  const data = await fetch(url).then(res => res.json());

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
};
