import type { AnyVault } from '../api/vaults/types.ts';
import { fetchAppVaults } from './appConfigs.ts';
import type { ApiChain } from './chain.ts';

export async function getVaults(chainId: ApiChain): Promise<AnyVault[]> {
  const vaults = await fetchAppVaults(chainId);

  // older standard vaults have no type
  return vaults.map((vault: any) => {
    if ('type' in vault) {
      return {
        ...vault,
        isGovVault: vault.type === 'gov',
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
