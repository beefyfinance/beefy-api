import {
  createPublicClient,
  getContract,
  http,
  HttpTransport,
  HttpTransportConfig,
  PublicClient,
} from 'viem';
import { Abi } from 'abitype';
import { getChain } from './chains';
import { ChainId } from '../../../packages/address-book/address-book';
import { rateLimitedHttp } from './transport';
import PQueue from 'p-queue';
import { envBoolean, envNumber } from '../../utils/env';

const multicallClientsByChain: Record<number, PublicClient> = {};
const singleCallClientsByChain: Record<number, PublicClient> = {};
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
      carryoverConcurrencyCount: true,
      autoStart: true,
      timeout: 30 * 1000,
      throwOnTimeout: true,
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

const getMulticallClientForChain = (chainId: ChainId): PublicClient => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);
  if (!multicallClientsByChain[chain.id]) {
    const url = chain.rpcUrls.public.http[0];
    multicallClientsByChain[chain.id] = createPublicClient({
      batch: {
        multicall: {
          batchSize: 1024,
          wait: parseInt(process.env.BATCH_WAIT) ?? 1500,
        },
      },
      chain: chain,
      transport: makeHttpTransport(url, {
        // Test impact before enabling
        // batch: {
        //   wait: 500,
        //   batchSize: 1000
        // },
        timeout: 15000,
        retryCount: 5,
        retryDelay: 100,
      }),
    });
  }
  return multicallClientsByChain[chain.id];
};

const getSingleCallClientForChain = (chainId: ChainId): PublicClient => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);
  if (!singleCallClientsByChain[chain.id]) {
    const url = chain.rpcUrls.public.http[0];
    singleCallClientsByChain[chain.id] = createPublicClient({
      chain: chain,
      transport: makeHttpTransport(url, {
        timeout: 15000,
        retryCount: 3,
        retryDelay: 350,
      }),
    });
  }
  return singleCallClientsByChain[chain.id];
};

export const fetchContract = <ContractAbi extends Abi>(
  address: string,
  abi: ContractAbi,
  chainId: ChainId
) => {
  const publicClient = getMulticallClientForChain(chainId);
  return getContract({ address: address as `0x${string}`, abi, publicClient });
};

export const fetchNoMulticallContract = <ContractAbi extends Abi>(
  address: string,
  abi: ContractAbi,
  chainId: ChainId
) => {
  const publicClient = getSingleCallClientForChain(chainId);
  return getContract({ address: address as `0x${string}`, abi, publicClient });
};

export const getRPCClient = (chainId: ChainId): PublicClient => getMulticallClientForChain(chainId);
