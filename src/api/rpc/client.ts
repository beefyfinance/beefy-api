import PQueue from 'p-queue';
import type { Abi } from 'viem';
import {
  type Address,
  type Client,
  createClient,
  createPublicClient,
  type FallbackTransport,
  fallback,
  getContract,
  type HttpTransport,
  type HttpTransportConfig,
  http,
  type PublicClient,
} from 'viem';
import type { ApiChainId } from '../../utils/chain.ts';
import { envBoolean, envNumber } from '../../utils/env.ts';
import { getChain } from './chains.ts';
import { rateLimitedHttp } from './transport.ts';

const BATCH_WAIT = envNumber('BATCH_WAIT', 1500);

const multicallClientsByChain: Partial<Record<ApiChainId, Client>> = {};
const singleCallClientsByChain: Partial<Record<ApiChainId, Client>> = {};

const publicClientsByChain: Partial<Record<ApiChainId, PublicClient>> = {};
const queueByDomain: Record<string, PQueue> = {};

/**
 * Return a new queue per domain
 * @param rpcUrl
 */
function getQueueFor(rpcUrl: string): PQueue {
  const { hostname } = new URL(rpcUrl);
  if (!queueByDomain[hostname]) {
    // Default: Max 5 requests per second with 2 active requests
    queueByDomain[hostname] = new PQueue({
      concurrency: envNumber('RPC_RATE_LIMIT_CONCURRENCY', 2),
      intervalCap: envNumber('RPC_RATE_LIMIT_INTERVAL_CAP', 5),
      interval: envNumber('RPC_RATE_LIMIT_INTERVAL', 1000),
      carryoverIntervalCount: true,
      autoStart: true,
      timeout: 30 * 1000,
    });
  }

  return queueByDomain[hostname];
}

function makeHttpTransport(url: string, config: HttpTransportConfig = {}): HttpTransport {
  // Default: disable rate limiting
  if (envBoolean('RPC_RATE_LIMIT', false)) {
    const queue = getQueueFor(url);
    return rateLimitedHttp(queue, url, config);
  }

  return http(url, config);
}

function makeFallbackTransport(rpcUrls: string[] | readonly string[]): FallbackTransport {
  const transports = rpcUrls.map((url: string) =>
    makeHttpTransport(url, {
      timeout: 15000,
      retryCount: 0,
      retryDelay: 100,
    })
  );
  return fallback(transports);
}

export const getMulticallClientForChain = (chainId: ApiChainId): Client => {
  const chain = getChain(chainId);
  if (!multicallClientsByChain[chainId]) {
    multicallClientsByChain[chainId] = createClient({
      batch: {
        multicall: {
          batchSize: 1024,
          wait: BATCH_WAIT,
        },
      },
      chain: chain,
      transport: makeFallbackTransport(chain.rpcUrls.default.http),
    });
  }
  return multicallClientsByChain[chainId];
};

const getPublicClientForChain = (chainId: ApiChainId): PublicClient => {
  const chain = getChain(chainId);
  if (!publicClientsByChain[chainId]) {
    publicClientsByChain[chainId] = createPublicClient({
      batch: {
        multicall: {
          batchSize: 1024,
          wait: BATCH_WAIT,
        },
      },
      chain: chain,
      transport: makeFallbackTransport(chain.rpcUrls.default.http),
    });
  }
  return publicClientsByChain[chainId];
};

const getSingleCallClientForChain = (chainId: ApiChainId): Client => {
  const chain = getChain(chainId);
  if (!singleCallClientsByChain[chainId]) {
    singleCallClientsByChain[chainId] = createClient({
      chain: chain,
      transport: makeFallbackTransport(chain.rpcUrls.default.http),
    });
  }
  return singleCallClientsByChain[chainId];
};

export const fetchContract = <ContractAbi extends Abi>(address: string, abi: ContractAbi, chainId: ApiChainId) => {
  const client = getMulticallClientForChain(chainId);
  return getContract({ address: address as Address, abi, client });
};

export const fetchNoMulticallContract = <ContractAbi extends Abi>(
  address: string,
  abi: ContractAbi,
  chainId: ApiChainId
) => {
  const client = getSingleCallClientForChain(chainId);
  return getContract({ address: address as Address, abi, client });
};

export const getRPCClient = (chainId: ApiChainId): PublicClient => getPublicClientForChain(chainId);
