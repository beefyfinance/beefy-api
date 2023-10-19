import PQueue from 'p-queue';
import { RateLimitedOneInchSwapApi } from './RateLimitedOneInchSwapApi';
import { AnyChain, ApiChain, toApiChain, toChainId } from '../../../utils/chain';
import { OneInchPriceApi } from './OneInchPriceApi';
import { IOneInchPriceApi, IOneInchSwapApi } from './types';

// Configure to just under RPS allowed by our account
const API_QUEUE_CONFIG = {
  concurrency: 5,
  intervalCap: 5,
  interval: 1000,
  carryoverConcurrencyCount: true,
  autoStart: true,
  timeout: 30 * 1000,
  throwOnTimeout: true,
};

const swapApiByChain: Partial<Record<ApiChain, IOneInchSwapApi>> = {};
const priceApiByChain: Partial<Record<ApiChain, IOneInchPriceApi>> = {};
let swapApiQueue: PQueue | undefined;

export function getOneInchSwapApi(chain: AnyChain): IOneInchSwapApi {
  const apiChain = toApiChain(chain);

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

export function getOneInchPriceApi(chain: AnyChain, oracleAddress: string): IOneInchPriceApi {
  const apiChain = toApiChain(chain);

  if (!priceApiByChain[apiChain]) {
    priceApiByChain[apiChain] = new OneInchPriceApi(apiChain, oracleAddress);
  }

  return priceApiByChain[apiChain];
}
