import PQueue from 'p-queue';
import { type AnyChain, type ApiChain, getChainConfig, SupportedChains, toApiChain } from '../../../../utils/chain.ts';
import { RateLimitedKyberApi } from './RateLimitedKyberApi.ts';
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
export const supportedChains = new Map<ApiChain, string>(
  SupportedChains.flatMap(chain => {
    const kyberChain = getChainConfig(chain).integrations.kyber;
    return kyberChain ? [[chain, kyberChain] as const] : [];
  })
);

const swapApiByChain: Partial<Record<ApiChain, IKyberApi>> = {};
let swapApiQueue: PQueue | undefined;

export function getKyberApi(chain: AnyChain): IKyberApi {
  const apiChain = toApiChain(chain);
  const kyberChain = supportedChains.get(apiChain);
  if (!kyberChain) {
    throw new Error(`Kyber api is not supported on ${apiChain}`);
  }

  const existing = swapApiByChain[apiChain];
  if (existing) {
    return existing;
  }

  if (!swapApiQueue) {
    swapApiQueue = new PQueue(API_QUEUE_CONFIG);
  }

  const baseUrl = `https://aggregator-api.kyberswap.com/${kyberChain}/api/v1`;
  const clientId = process.env.KYBER_CLIENT_ID;
  if (!clientId) {
    throw new Error(`KYBER_CLIENT_ID env variable is not set`);
  }

  const api = new RateLimitedKyberApi(baseUrl, clientId, swapApiQueue);
  swapApiByChain[apiChain] = api;
  return api;
}
