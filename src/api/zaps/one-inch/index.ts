import PQueue from 'p-queue';
import { RateLimitedOneInchSwapApi } from './RateLimitedOneInchSwapApi';
import { AnyChain, ApiChain, toApiChain, toChainId } from '../../../utils/chain';
import { OneInchPriceApi } from './OneInchPriceApi';
import { IOneInchPriceApi, IOneInchSwapApi } from './types';

const DEFAULT_API_URL = 'https://api.1inch.io';
const API_URL = process.env.ONE_INCH_API || DEFAULT_API_URL;
// With custom api endpoint we can do more requests per second
const API_QUEUE_CONFIG_CUSTOM = {
  concurrency: 30,
  intervalCap: 60,
  interval: 1000,
};
// Default config is really slow at 1 per 2 seconds
const API_QUEUE_CONFIG = {
  concurrency: 1,
  intervalCap: 1,
  interval: 2000,
  carryoverConcurrencyCount: true,
  autoStart: true,
  timeout: 60 * 1000,
  throwOnTimeout: true,
  ...(API_URL === DEFAULT_API_URL ? {} : API_QUEUE_CONFIG_CUSTOM),
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
    const baseUrl = `${API_URL}/v5.0/${chainId}`;
    swapApiByChain[apiChain] = new RateLimitedOneInchSwapApi(baseUrl, swapApiQueue);
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
