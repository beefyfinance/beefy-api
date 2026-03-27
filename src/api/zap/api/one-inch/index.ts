import PQueue from 'p-queue';
import { RateLimitedOneInchSwapApi } from './RateLimitedOneInchSwapApi';
import { AnyChain, ApiChain, toApiChain, toChainId } from '../../../../utils/chain';
import { IOneInchSwapApi } from './types';

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

export const supportedSwapChains: Partial<Record<ApiChain, boolean>> = {
  ethereum: true,
  bsc: true,
  polygon: true,
  optimism: true,
  arbitrum: true,
  gnosis: true,
  avax: true,
  zksync: true,
  base: true,
  linea: true,
  sonic: true,
  // unichain: true,
} as const;

const swapApiByChain: Partial<Record<ApiChain, IOneInchSwapApi>> = {};

let swapApiQueue: PQueue | undefined;

export function getOneInchSwapApi(chain: AnyChain): IOneInchSwapApi {
  const apiChain = toApiChain(chain);
  if (!supportedSwapChains[apiChain]) {
    throw new Error(`OneInch swap api is not supported on ${apiChain}`);
  }

  if (!swapApiByChain[apiChain]) {
    if (!swapApiQueue) {
      swapApiQueue = new PQueue(API_QUEUE_CONFIG);
    }

    const chainId = toChainId(apiChain);
    const baseUrl = `https://api.1inch.com/swap/v6.1/${chainId}`;
    const apiKey = process.env.ONE_INCH_API_KEY;
    if (!apiKey) {
      throw new Error(`ONE_INCH_API_KEY env variable is not set`);
    }
    swapApiByChain[apiChain] = new RateLimitedOneInchSwapApi(baseUrl, apiKey, swapApiQueue, apiChain);
  }

  return swapApiByChain[apiChain];
}
