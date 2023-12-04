import PQueue from 'p-queue';
import { RateLimitedOneInchSwapApi } from './RateLimitedOneInchSwapApi';
import { AnyChain, ApiChain, toApiChain, toChainId } from '../../../../utils/chain';
import { IOneInchPriceApi, IOneInchSwapApi } from './types';

// Configure to just under RPS allowed by our account
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 250ms is 4 RPS
  interval: 250,
  carryoverConcurrencyCount: true,
  autoStart: true,
  timeout: 30 * 1000,
  throwOnTimeout: true,
};

export const supportedSwapChains: Partial<Record<ApiChain, boolean>> = {
  ethereum: true,
  arbitrum: true,
  optimism: true,
  zksync: true,
  base: true,
  bsc: true,
  polygon: true,
  gnosis: true,
  avax: true,
  fantom: true,
  aurora: true,
} as const;

const swapApiByChain: Partial<Record<ApiChain, IOneInchSwapApi>> = {};
const priceApiByChain: Partial<Record<ApiChain, IOneInchPriceApi>> = {};
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
    const baseUrl = `https://api.1inch.dev/swap/v5.2/${chainId}`;
    const apiKey = process.env.ONE_INCH_API_KEY;
    if (!apiKey) {
      throw new Error(`ONE_INCH_API_KEY env variable is not set`);
    }
    swapApiByChain[apiChain] = new RateLimitedOneInchSwapApi(baseUrl, apiKey, swapApiQueue);
  }

  return swapApiByChain[apiChain];
}
