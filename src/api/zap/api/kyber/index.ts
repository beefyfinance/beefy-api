import PQueue from 'p-queue';
import { RateLimitedKyberApi } from './RateLimitedKyberApi.ts';
import { type AnyChain, type ApiChain, toApiChain } from '../../../../utils/chain.ts';
import type { IKyberApi } from './types.ts';

// Configure rate limiting
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 200ms is 5 RPS
  interval: 200,
  carryoverIntervalCount: true,
  autoStart: true,
  timeout: 30 * 1000,
};

// @see https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/aggregator-api-specification/evm-swaps
export const supportedChains: Partial<Record<ApiChain, string>> = {
  ethereum: 'ethereum',
  bsc: 'bsc',
  arbitrum: 'arbitrum',
  polygon: 'polygon',
  optimism: 'optimism',
  avax: 'avalanche',
  base: 'base',
  linea: 'linea',
  mantle: 'mantle',
  sonic: 'sonic',
  berachain: 'berachain',
  // unichain: 'unichain',
  hyperevm: 'hyperevm',
  plasma: 'plasma',
  monad: 'monad',
  megaeth: 'megaeth',
  robinhood: 'robinhood',
} as const;

const swapApiByChain: Partial<Record<ApiChain, IKyberApi>> = {};
let swapApiQueue: PQueue | undefined;

export function getKyberApi(chain: AnyChain): IKyberApi {
  const apiChain = toApiChain(chain);
  const kyberChain = supportedChains[apiChain];
  if (!kyberChain) {
    throw new Error(`Kyber api is not supported on ${apiChain}`);
  }

  if (!swapApiByChain[apiChain]) {
    if (!swapApiQueue) {
      swapApiQueue = new PQueue(API_QUEUE_CONFIG);
    }

    const baseUrl = `https://aggregator-api.kyberswap.com/${kyberChain}/api/v1`;
    const clientId = process.env.KYBER_CLIENT_ID;
    if (!clientId) {
      throw new Error(`KYBER_CLIENT_ID env variable is not set`);
    }

    swapApiByChain[apiChain] = new RateLimitedKyberApi(baseUrl, clientId, swapApiQueue);
  }

  return swapApiByChain[apiChain];
}
