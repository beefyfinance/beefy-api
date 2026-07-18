import { getMerklAprByExplorerAddress } from '../../offchain-rewards/providers/merkl/proxyClient.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
const logger = getLoggerFor({ module: 'apy', platform: 'merkl' });

export const getMerklApys = async (chainId, pools) => {
  const merklAprByAddress = await getMerklV4AprByExplorerAddress(
    chainId,
    pools.map(p => p.address)
  );

  return pools.map(pool => merklAprByAddress[pool.address.toLowerCase()] ?? 0);
};

const getMerklV4AprByExplorerAddress = async (chainId, explorerAddresses) => {
  if (explorerAddresses.length === 0) return {};
  try {
    return await getMerklAprByExplorerAddress(chainId, explorerAddresses);
  } catch (e) {
    logger.warn({ chain: chainId, err: e }, 'failed to fetch merkl aprs via proxy');
    return {};
  }
};
