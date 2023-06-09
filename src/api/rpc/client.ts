import { PublicClient, createPublicClient, http, getContract } from 'viem';
import { Chain } from 'viem/chains';
import { Abi } from 'abitype';
import { getChain } from './chains';
import { ChainId } from '../../../packages/address-book/address-book';

const clientsByChain: Record<number, PublicClient> = {};

const getClientForChain = (chainId: ChainId): PublicClient => {
  const chain = getChain[chainId];
  if (!clientsByChain[chain.id]) {
    console.log('Creating client for chain ' + chain.name);
    clientsByChain[chain.id] = createPublicClient({
      batch: {
        multicall: {
          batchSize: 128,
          wait: parseInt(process.env.BATCH_WAIT) ?? 1500,
        },
      },
      chain: chain,
      transport: http(chain.rpcUrls.public.http[0], {
        // Test impact before enabling
        // batch: {
        //   wait: 1500,
        //   batchSize: 1024
        // },
        timeout: 15000,
        retryCount: 3,
        retryDelay: 350,
      }),
    });
  }
  return clientsByChain[chain.id];
};

export const fetchContract = <ContractAbi extends Abi>(
  address: `0x${string}`,
  abi: ContractAbi,
  chainId: ChainId
) => {
  const publicClient = getClientForChain(chainId);
  return getContract({ address, abi, publicClient });
};
