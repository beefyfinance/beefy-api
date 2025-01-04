import PQueue from 'p-queue';
import { RateLimitedOdosApi } from './RateLimitedOdosApi';
import { AnyChain, ApiChain, toApiChain } from '../../../../utils/chain';
import { IOdosApi } from './types';

// Configure rate limiting
const API_QUEUE_CONFIG = {
  concurrency: 2,
  intervalCap: 2, // 2 per 600ms is 3.3 RPS
  interval: 200, // 600 for standard
  carryoverConcurrencyCount: false,
  autoStart: true,
  timeout: 30 * 1000,
  throwOnTimeout: true,
};

// @see https://docs.odos.xyz/api/endpoints/#/Info/get_chain_ids_info_chains_get
export const supportedChains: Partial<Record<ApiChain, number>> = {
  ethereum: 1,
  zksync: 324,
  base: 8453,
  mantle: 5000,
  polygon: 137,
  optimism: 10,
  mode: 34443,
  avax: 43114,
  linea: 59144,
  arbitrum: 42161,
  bsc: 56,
  fantom: 250,
  scroll: 534352,
  sonic: 146,
} as const;

const swapApiByChain: Partial<Record<ApiChain, IOdosApi>> = {};
let swapApiQueue: PQueue | undefined;

export function getOdosApi(chain: AnyChain): IOdosApi {
  const apiChain = toApiChain(chain);
  const odosChain = supportedChains[apiChain];
  if (!odosChain) {
    throw new Error(`Odos api is not supported on ${apiChain}`);
  }

  if (!swapApiByChain[apiChain]) {
    if (!swapApiQueue) {
      swapApiQueue = new PQueue(API_QUEUE_CONFIG);
    }
    const apiKey = process.env.ODOS_API_KEY;
    if (!apiKey) {
      throw new Error(`ODOS_API_KEY env variable is not set`);
    }
    // Dropping public url `https://api.odos.xyz` for enterprise
    const baseUrl = `https://enterprise-api.odos.xyz`;
    swapApiByChain[apiChain] = new RateLimitedOdosApi(baseUrl, apiKey, apiChain, swapApiQueue);
  }

  return swapApiByChain[apiChain];
}
