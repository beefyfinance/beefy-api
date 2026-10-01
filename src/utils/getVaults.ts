import type { AnyVault } from '../api/vaults/types.ts';
import { fetchAppVaults } from './appConfigs.ts';
import type { ApiChain } from './chain.ts';

export async function getVaults(chainId: ApiChain): Promise<AnyVault[]> {
  const vaults = await fetchAppVaults(chainId);
  return vaults.map(vault => withVaultDefaults(vault, chainId));
}

/** `vault` is unchecked json; older standard vaults have no type */
export function withVaultDefaults(vault: any, chain: string) {
  if ('type' in vault) {
    return {
      ...vault,
      isGovVault: vault.type === 'gov',
      chain,
    };
  } else {
    return {
      ...vault,
      isGovVault: false,
      type: 'standard',
      chain,
    };
  }
}
