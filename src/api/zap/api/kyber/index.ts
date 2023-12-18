import PQueue from 'p-queue';
import { RateLimitedKyberApi } from './RateLimitedKyberApi';
import { AnyChain, ApiChain, toApiChain } from '../../../../utils/chain';
import { IKyberApi } from './types';

// Configure rate limiting
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 200ms is 5 RPS
  interval: 200,
  carryoverConcurrencyCount: true,
  autoStart: true,
  timeout: 30 * 1000,
  throwOnTimeout: true,
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
  cronos: 'cronos',
  zksync: 'zksync',
  fantom: 'fantom',
  linea: 'linea',
  zkevm: 'polygon-zkevm',
  aurora: 'aurora',
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
