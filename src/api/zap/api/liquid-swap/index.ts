import PQueue from 'p-queue';
import { RateLimitedLiquidSwapApi } from './RateLimitedLiquidSwapApi.ts';
import { type AnyChain, type ApiChain, toApiChain } from '../../../../utils/chain.ts';
import type { ILiquidSwapApi } from './types.ts';

// Configure rate limiting
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 200ms is 5 RPS
  interval: 200,
  carryoverIntervalCount: true,
  autoStart: true,
  timeout: 30 * 1000,
};

export const supportedChains = new Set<ApiChain>(['hyperevm']);

const swapApiByChain: Partial<Record<ApiChain, ILiquidSwapApi>> = {};
let swapApiQueue: PQueue | undefined;

export function getLiquidSwapApi(chain: AnyChain): ILiquidSwapApi {
  const apiChain = toApiChain(chain);
  if (!supportedChains.has(apiChain)) {
    throw new Error(`LiquidSwap api is not supported on ${apiChain}`);
  }

  if (!swapApiByChain[apiChain]) {
    if (!swapApiQueue) {
      swapApiQueue = new PQueue(API_QUEUE_CONFIG);
    }

    const baseUrl = `https://api.liqd.ag/v2`;
    swapApiByChain[apiChain] = new RateLimitedLiquidSwapApi(baseUrl, swapApiQueue);
  }

  return swapApiByChain[apiChain];
}
