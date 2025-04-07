import BigNumber from 'bignumber.js';
import { ApiChain, AppChain } from '../../utils/chain';

export type StandardVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets?: string[];
  strategyTypeId: string;
  risks: string[];
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  /** @deprecated */
  isGovVault?: boolean;
  type: 'standard';
  strategy: string;
  lastHarvest?: number;
  pricePerFullShare: BigNumber;
  createdAt: number;
  retiredAt?: number | undefined;
  chain: ApiChain;
};

export type GovVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals: number;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets: string[];
  risks: string[];
  strategyTypeId: string;
  isGovVault: boolean;
  type: 'gov';
  network: AppChain;
  createdAt: number;
  retiredAt?: number | undefined;
  totalSupply: number;
  chain: ApiChain;
  lastHarvest?: number; // for CLM Pools only (copied from CLM base)
};

export type CowVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  depositTokenAddresses: string[];
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets?: string[];
  strategyTypeId: string;
  risks: string[];
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  /** @deprecated */
  isGovVault?: boolean;
  type: 'cowcentrated';
  strategy: string;
  lastHarvest?: number;
  createdAt: number;
  retiredAt?: number | undefined;
  chain: ApiChain;
};

export type Erc4626Vault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets?: string[];
  strategyTypeId: string;
  risks: string[];
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  /** @deprecated */
  isGovVault?: boolean;
  type: 'erc4626';
  /** for ERC4626 harvest() / lastHarvest() is on the vault contract itself, so this is same as earnContractAddress */
  strategy: string;
  lastHarvest?: number;
  pricePerFullShare: BigNumber;
  createdAt: number;
  retiredAt?: number | undefined;
  chain: ApiChain;
};

export type HarvestableVault = StandardVault | CowVault | Erc4626Vault;

export type AnyVault = StandardVault | GovVault | CowVault | Erc4626Vault;

export type VaultOfType<T extends AnyVault['type']> = Extract<AnyVault, { type: T }>;

export type ClmWithVaultPool = CowVault & {
  vault?: StandardVault;
  pool?: GovVault;
};

export function isVaultOfType<T extends AnyVault['type']>(vault: AnyVault, type: T): vault is VaultOfType<T> {
  return vault.type === type;
}
