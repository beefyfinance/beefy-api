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

  // TODO beSonic - for testing, remove once live
  if (chainId === 'sonic') {
    const exists = vaults.find(v => v.id === 'beefy-besonic');
    if (!exists) {
      vaults.push({
        id: 'beefy-besonic',
        name: 'beSonic',
        type: 'erc4626',
        subType: 'erc7540:withdraw',
        token: 'WS',
        tokenAddress: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
        tokenDecimals: 18,
        earnContractAddress: '0x871A101Dcf22fE4fE37be7B654098c801CBA1c88',
        earnedToken: 'beS',
        earnedTokenAddress: '0x871A101Dcf22fE4fE37be7B654098c801CBA1c88',
        oracle: 'tokens',
        oracleId: 'WS',
        status: 'active',
        createdAt: 1744038202,
        platformId: 'beefy',
        assets: ['WS'],
        migrationIds: [],
        risks: ['COMPLEXITY_LOW', 'IL_NONE', 'MCAP_MEDIUM', 'AUDIT', 'CONTRACTS_VERIFIED'],
        strategyTypeId: 'besonic',
        pointStructureIds: ['sonic-points'],
        network: 'sonic',
        zaps: [
          {
            strategyId: 'single',
            disableWithdraw: true,
          },
        ],
      });
    }
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
