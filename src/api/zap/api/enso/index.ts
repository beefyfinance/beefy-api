import PQueue from 'p-queue';
import type { Address } from 'viem';
import { type ApiChain, getChainConfig, SupportedChains, toChainId } from '../../../../utils/chain.ts';
import { getZapRouter } from '../common.ts';
import { RateLimitedEnsoApi } from './RateLimitedEnsoApi.ts';

export { isEnsoCircuitOpenedSince } from './EnsoApi.ts';

import type { IEnsoApi } from './types.ts';

// Configure rate limiting; worst case across both queues is 9 requests in any second (Enso limit is 10 RPS)
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 1, // 1 per 500ms is 2 RPS for the crawler
  interval: 500,
  carryoverIntervalCount: true,
  autoStart: true,
  timeout: 30 * 1000,
};

const PROXY_QUEUE_CONFIG = {
  concurrency: 4,
  intervalCap: 2, // 2 per 500ms is 4 RPS for the app proxy, without spacing out the first two
  interval: 500,
  // Carryover counts in-flight requests against the next interval, so 2 slow quotes would block a 3rd
  carryoverIntervalCount: false,
  autoStart: true,
  timeout: 15 * 1000,
};

/** Allowed tx.to per chain; swaps fail closed if Enso returns any other address */
const ENSO_ROUTERS: Partial<Record<ApiChain, readonly Address[]>> = {
  ethereum: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  polygon: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  bsc: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  avax: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  arbitrum: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  optimism: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  base: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  hyperevm: ['0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf'],
  plasma: ['0xCfBAa9Cfce952Ca4F4069874fF1Df8c05e37a3c7'],
  monad: ['0xCfBAa9Cfce952Ca4F4069874fF1Df8c05e37a3c7'],
  megaeth: ['0xCfBAa9Cfce952Ca4F4069874fF1Df8c05e37a3c7'],
  robinhood: ['0xCfBAa9Cfce952Ca4F4069874fF1Df8c05e37a3c7'],
  arc: ['0xCfBAa9Cfce952Ca4F4069874fF1Df8c05e37a3c7'],
};

export const supportedSwapChains = new Set<ApiChain>(
  SupportedChains.filter(chain => getChainConfig(chain).integrations.enso)
);

const swapApiByChain: Partial<Record<ApiChain, IEnsoApi>> = {};

let swapApiQueue: PQueue | undefined;
let proxyApiQueue: PQueue | undefined;

export function getEnsoApi(apiChain: ApiChain): IEnsoApi {
  if (!supportedSwapChains.has(apiChain)) {
    throw new Error(`Enso api is not supported on ${apiChain}`);
  }

  const existing = swapApiByChain[apiChain];
  if (existing) {
    return existing;
  }

  const routers = ENSO_ROUTERS[apiChain];
  if (!routers || routers.length === 0) {
    throw new Error(`Enso router address is not configured for ${apiChain}`);
  }

  const zapRouter = getZapRouter(apiChain);
  if (!zapRouter) {
    throw new Error(`Zap router address is not configured for ${apiChain}`);
  }

  swapApiQueue ??= new PQueue(API_QUEUE_CONFIG);
  proxyApiQueue ??= new PQueue(PROXY_QUEUE_CONFIG);

  const apiKey = process.env.ENSO_API_KEY;
  if (!apiKey) {
    throw new Error(`ENSO_API_KEY env variable is not set`);
  }

  const api = new RateLimitedEnsoApi(
    'https://api.enso.build/api/v1',
    toChainId(apiChain),
    routers,
    zapRouter,
    apiKey,
    swapApiQueue,
    proxyApiQueue
  );
  swapApiByChain[apiChain] = api;
  return api;
}
