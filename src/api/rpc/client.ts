import { PublicClient, createPublicClient, http, getContract } from 'viem';
import { Abi } from 'abitype';
import { getChain } from './chains';
import { ChainId } from '../../../packages/address-book/address-book';

const multicallClientsByChain: Record<number, PublicClient> = {};
const singleCallClientsByChain: Record<number, PublicClient> = {};

const getMulticallClientForChain = (chainId: ChainId): PublicClient => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);
  if (!multicallClientsByChain[chain.id]) {
    multicallClientsByChain[chain.id] = createPublicClient({
      batch: {
        multicall: {
          batchSize: 1024,
          wait: parseInt(process.env.BATCH_WAIT) ?? 1500,
        },
      },
      chain: chain,
      transport: http(chain.rpcUrls.public.http[0], {
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
    singleCallClientsByChain[chain.id] = createPublicClient({
      chain: chain,
      transport: http(chain.rpcUrls.public.http[0], {
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
