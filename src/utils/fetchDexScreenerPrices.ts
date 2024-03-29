import { ApiChain } from './chain';
import { uniq } from 'lodash';
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

function enchancePairs(pairs: DexScreenerPair[]): EnhancedPair[] {
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
        liquidityUsd: pair.liquidity.usd,
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

/**
 * Fetches prices from DexScreener
 * Picks the pair with the highest liquidity for each requested token
 * Response may contain undefined prices
 */
export async function fetchDexScreenerPrices(requests: PriceRequest[]): Promise<PriceResponse[]> {
  if (requests.length === 0) {
    return [];
  }

  const addresses = uniq(requests.map(r => r.tokenAddress));
  const url = `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(',')}`;
  const response = await fetch(url);
  const data = (await response.json()) as DexScreenerResponse;
  const allPairs = enchancePairs(data.pairs);

  return requests.map(({ chainId, tokenAddress }) => {
    const prices = allPairs
      .filter(
        p =>
          p.chainId === chainId &&
          (p.baseToken.address === tokenAddress || p.quoteToken.address === tokenAddress)
      )
      .sort((a, b) => b.liquidityUsd - a.liquidityUsd)
      .map(p =>
        p.baseToken.address === tokenAddress ? p.baseToken.priceUsd : p.quoteToken.priceUsd
      );

    return { chainId, tokenAddress, price: prices[0] ?? undefined };
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
        console.warn(
          `Duplicate price for oracle ${oracleId} via fetchDexScreenerPriceOracles, ignoring`
        );
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
