import { Vault, GovVault } from '../vaults/types';
import { ApiChain } from '../../utils/chain';

export declare function getMultichainVaults(): Vault[];
export declare function getSingleChainVaults(chain: ApiChain): Vault[] | undefined;
export declare function getVaultByID(vaultId: string): Vault | undefined;
export declare function initVaultService(): Promise<void>;
export declare function getMultichainGovVaults(): Vault[];
export declare function getSingleChainGovVaults(chain: ApiChain): GovVault[] | undefined;
export declare function getGovVaultByID(vaultId: string): GovVault | undefined;
