import { Vault, GovVault, CowVault } from '../vaults/types';
import { ApiChain } from '../../utils/chain';

export declare function initVaultService(): Promise<void>;

export declare function getMultichainVaults(): Vault[];
export declare function getSingleChainVaults(chain: ApiChain): Vault[] | undefined;
export declare function getVaultByID(vaultId: string): Vault | undefined;

export declare function getMultichainGovVaults(): Vault[];
export declare function getSingleChainGovVaults(chain: ApiChain): GovVault[] | undefined;
export declare function getGovVaultByID(vaultId: string): GovVault | undefined;

export declare function getMultichainCowVaults(): CowVault[];
export declare function getSingleChainCowVaults(chain: ApiChain): CowVault[] | undefined;
export declare function getCowVaultById(vaultId: string): CowVault | undefined;
