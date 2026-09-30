import PQueue from 'p-queue';
import {
  type AnyChain,
  type ApiChain,
  getChainConfig,
  SupportedChains,
  toApiChain,
  toChainId,
} from '../../../../utils/chain.ts';
import { RateLimitedOneInchSwapApi } from './RateLimitedOneInchSwapApi.ts';
import type { IOneInchSwapApi } from './types.ts';

// Configure rate limiting
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 200ms is 5 RPS
  interval: 200,
  carryoverIntervalCount: true,
  autoStart: true,
  timeout: 30 * 1000,
};

export const supportedSwapChains = new Set<ApiChain>(
  SupportedChains.filter(chain => getChainConfig(chain).integrations.oneInch)
);

const swapApiByChain: Partial<Record<ApiChain, IOneInchSwapApi>> = {};

let swapApiQueue: PQueue | undefined;

export function getOneInchSwapApi(chain: AnyChain): IOneInchSwapApi {
  const apiChain = toApiChain(chain);
  if (!supportedSwapChains.has(apiChain)) {
    throw new Error(`OneInch swap api is not supported on ${apiChain}`);
  }

  const existing = swapApiByChain[apiChain];
  if (existing) {
    return existing;
  }

  if (!swapApiQueue) {
    swapApiQueue = new PQueue(API_QUEUE_CONFIG);
  }

  const chainId = toChainId(apiChain);
  const baseUrl = `https://api.1inch.com/swap/v6.1/${chainId}`;
  const apiKey = process.env.ONE_INCH_API_KEY;
  if (!apiKey) {
    throw new Error(`ONE_INCH_API_KEY env variable is not set`);
  }

  const api = new RateLimitedOneInchSwapApi(baseUrl, apiKey, swapApiQueue);
  swapApiByChain[apiChain] = api;
  return api;
}
