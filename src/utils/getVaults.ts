import type { AnyVault } from '../api/vaults/types.ts';
import { type ApiChain, toAppChain } from './chain.ts';

export async function getVaults(chainId: ApiChain): Promise<AnyVault[]> {
  const endpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/${toAppChain(chainId)}.json`;
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
