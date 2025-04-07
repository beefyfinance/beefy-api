import { AnyVault } from '../api/vaults/types';
import { ApiChain } from './chain';
import { MULTICHAIN_ENDPOINTS } from '../constants';

export async function getVaults(chainId: ApiChain): Promise<AnyVault[]> {
  const endpoint = MULTICHAIN_ENDPOINTS[chainId];
  if (!endpoint) {
    throw new Error(`No endpoint found for chain ${chainId}`);
  }

  const response = await fetch(endpoint);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch vaults for ${endpoint}: ${response.status} ${response.statusText}`);
  }

  const vaults = await response.json();
  if (!vaults || !Array.isArray(vaults)) {
    throw new Error(`Invalid vaults data for ${endpoint}`);
  }

  // Backwards compatibility
  return vaults.map(vault => {
    if ('type' in vault) {
      return {
        ...vault,
        isGovVault: vault.type === 'gov',
        chain: chainId,
      };
    } else if ('isGovVault' in vault) {
      return {
        ...vault,
        type: vault.isGovVault ? 'gov' : 'standard',
        chain: chainId,
      };
    } else {
      return {
        ...vault,
        isGovVault: false,
        type: 'standard',
        chain: chainId,
      };
    }
  });
}
