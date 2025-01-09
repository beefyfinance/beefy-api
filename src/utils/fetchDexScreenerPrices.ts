import { ApiChain } from './chain';
import { chunk, orderBy, uniqBy } from 'lodash';
import { isFiniteNumber } from './number';

const chainIdToDexScreenerChainId = {
  ethereum: 'ethereum',
  bsc: 'bsc',
  base: 'base',
  arbitrum: 'arbitrum',
  polygon: 'polygon',
  avax: 'avalanche',
  optimism: 'optimism',
  zksync: 'zksync',
  linea: 'linea',
  cronos: 'cronos',
  canto: 'canto',
  fantom: 'fantom',
  metis: 'metis',
  celo: 'celo',
  kava: 'kava',
  moonbeam: 'moonbeam',
  moonriver: 'moonriver',
  zkevm: 'polygonzkevm',
  gnosis: 'gnosischain',
  emerald: 'oasisemerald',
  aurora: 'aurora',
  one: 'harmony',
  fuse: 'fuse',
  mantle: 'mantle',
  sonic: 'sonic',
} as const satisfies Partial<Record<ApiChain, string>>;
const dexScreenerChainIdToChainId = Object.fromEntries(
  Object.entries(chainIdToDexScreenerChainId).map(([k, v]) => [v, k])
) as Record<string, ApiChain>;

type DexScreenerToken = {
  address: string;
  name: string;
  symbol: string;
};

type DexScreenerPair = {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  /** price of baseToken expressed in quoteToken */
  priceNative: string;
  /** price of baseToken expressed in USD */
  priceUsd?: string;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
};

type DexScreenerResponse = {
  schemaVersion: string;
  pairs: DexScreenerPair[];
};

type EnchancedToken = DexScreenerToken & {
  priceUsd: number;
};

type EnhancedPair = {
  chainId: ApiChain;
  baseToken: EnchancedToken;
  quoteToken: EnchancedToken;
  liquidityUsd: number;
};

function enhancePairs(pairs: DexScreenerPair[]): EnhancedPair[] {
  return (
    pairs
      // Have price, and on supported chain
      .filter(pair => !!pair.priceUsd && pair.chainId in dexScreenerChainIdToChainId)
      // Calculate price of quote token in USD
      .map(pair => ({
        chainId: dexScreenerChainIdToChainId[pair.chainId],
        baseToken: {
          ...pair.baseToken,
          priceUsd: parseFloat(pair.priceUsd),
        },
        quoteToken: {
          ...pair.quoteToken,
          priceUsd: (1 / parseFloat(pair.priceNative)) * parseFloat(pair.priceUsd),
        },
        liquidityUsd: pair.liquidity?.usd || 0,
      }))
  );
}

type PriceRequest = {
  chainId: ApiChain;
  tokenAddress: string;
};

type PriceResponse = {
  chainId: ApiChain;
  tokenAddress: string;
  price: number | undefined;
};

async function fetchDexScreenerPairs(addresses: string[]): Promise<EnhancedPair[]> {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(',')}`;
  const response = await fetch(url);
  const data = (await response.json()) as DexScreenerResponse;
  return enhancePairs(data.pairs);
}

async function fetchDexScreenerPairsWithRetry(
  requests: PriceRequest[],
  retriesLeft: number = 0
): Promise<EnhancedPair[]> {
  const addresses = getRequestAddresses(requests);
  const results = await fetchDexScreenerPairs(addresses);
  if (retriesLeft === 0) {
    return results;
  }

  const unfulfilled = requests.filter(request => !results.some(pair => pairIsForRequest(pair, request)));
  if (unfulfilled.length === 0) {
    return results;
  }

  console.debug(
    `Retrying ${unfulfilled.length} unfulfilled DexScreener price requests (${retriesLeft - 1} retries left)`
  );
  const extraResults = await fetchDexScreenerPairsWithRetry(unfulfilled, --retriesLeft);
  return results.concat(extraResults);
}

function getRequestAddresses(requests: PriceRequest[]): string[] {
  return orderBy(
    uniqBy(requests, r => r.tokenAddress.toLowerCase()),
    [r => r.chainId, r => r.tokenAddress],
    ['asc', 'asc']
  ).map(r => r.tokenAddress);
}

function pairIsForRequest(pair: EnhancedPair, request: PriceRequest): boolean {
  return (
    pair.chainId === request.chainId &&
    (pair.baseToken.address === request.tokenAddress || pair.quoteToken.address === request.tokenAddress)
  );
}

/**
 * Fetches prices from DexScreener
 * Picks the pair with the highest liquidity for each requested token
 * Response may contain undefined prices
 */
export async function fetchDexScreenerPrices(requests: PriceRequest[]): Promise<PriceResponse[]> {
  if (requests.length === 0) {
    return [];
  }

  const allPairs = await fetchDexScreenerPairsWithRetry(requests, 1);

  return requests.map(request => {
    const prices = allPairs
      .filter(pair => pairIsForRequest(pair, request))
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd)
      .map(p =>
        p.baseToken.address === request.tokenAddress ? p.baseToken.priceUsd : p.quoteToken.priceUsd
      );

    return { ...request, price: prices[0] || undefined };
  });
}

export type OraclePriceRequest = PriceRequest & {
  oracleId: string;
};

/**
 * Fetches the prices from DexScreener and returns them as an oracleId:price map
 * Missing prices are not included in the result, duplicate oracles are logged and ignored
 */
export async function fetchDexScreenerPriceOracles(
  requests: OraclePriceRequest[]
): Promise<Record<string, number>> {
  const prices = await fetchDexScreenerPrices(requests);
  return prices.reduce((acc, { price }, i) => {
    const { oracleId, tokenAddress, chainId } = requests[i]!;

    if (isFiniteNumber(price)) {
      if (oracleId in acc) {
        console.warn(`Duplicate price for oracle ${oracleId} via fetchDexScreenerPriceOracles, ignoring`);
      } else {
        acc[oracleId] = price;
      }
    } else {
      console.error(
        `Invalid price for oracle ${oracleId} for ${tokenAddress} on ${chainId} via fetchDexScreenerPriceOracles, ignoring`
      );
    }

    return acc;
  }, {} as Record<string, number>);
}
