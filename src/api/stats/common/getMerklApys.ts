import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getMerklAprByExplorerAddress } from '../../offchain-rewards/providers/merkl/proxyClient.ts';

const logger = getLoggerFor({ module: 'apy', component: 'merkl' });

export type MerklApyPool = {
  address: string;
};

export const getMerklApys = async (chainId: ChainId, pools: MerklApyPool[]) => {
  const merklAprByAddress = await getMerklV4AprByExplorerAddress(
    chainId,
    pools.map(p => p.address)
  );

  return pools.map(pool => merklAprByAddress[pool.address.toLowerCase()] ?? 0);
};

const getMerklV4AprByExplorerAddress = async (
  chainId: ChainId,
  explorerAddresses: string[]
): Promise<Record<string, number>> => {
  if (explorerAddresses.length === 0) return {};
  try {
    return await getMerklAprByExplorerAddress(chainId, explorerAddresses);
  } catch (e) {
    logger.warn({ chain: chainId, err: e }, 'failed to fetch merkl aprs via proxy');
    return {};
  }
};
