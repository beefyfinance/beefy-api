import BigNumber from 'bignumber.js';
import { ApiChain, AppChain } from '../../utils/chain';
import { Address } from 'viem';

/** Added to all vault configs by API */
type ApiCommonVault = {
  /** Same as {network} except for harmony->one */
  chain: ApiChain;
  /** @deprecated use type === 'gov' */
  isGovVault?: boolean;
};

/** Added to standard vault configs by API */
type ApiStandardVault = ApiCommonVault & {
  /** Fetched on-chain, may not be available immediately after API start */
  pricePerFullShare?: BigNumber;
  /** Fetched on-chain, may not be available immediately after API start */
  strategy?: string;
  /** Fetched on-chain, may not be available immediately after API start */
  lastHarvest?: number;
};

/** Added to gov vault configs by API */
type ApiGovVault = ApiCommonVault & {
  /** CLM Pools only - Fetched on-chain, may not be available immediately after API start */
  lastHarvest?: number;
  /** Fetched on-chain, may not be available immediately after API start */
  totalSupply?: number;
};

/** Added to cowcentrated vault configs by API */
type ApiCowVault = ApiCommonVault & {
  /** Fetched on-chain, may not be available immediately after API start */
  strategy?: string;
  /** Fetched on-chain, may not be available immediately after API start */
  lastHarvest?: number;
};

/** Added to erc4626 vault configs by API */
type ApiErc4626Vault = ApiCommonVault & {
  /** Fetched on-chain, may not be available immediately after API start */
  pricePerFullShare?: BigNumber;
  /** For ERC4626 harvest() / lastHarvest() is on the vault contract itself, so this is same as earnContractAddress */
  strategy?: string;
  /** Fetched on-chain, may not be available immediately after API start */
  lastHarvest?: number;
};

export type StandardVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: Address | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: Address;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: Address;
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
  type: 'standard';
  createdAt: number;
  retiredAt?: number | undefined;
} & ApiStandardVault;

export type GovVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress: Address;
  tokenDecimals: number;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals: number;
  earnContractAddress: Address;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets: string[];
  risks: string[];
  strategyTypeId: string;
  type: 'gov';
  network: AppChain;
  createdAt: number;
  retiredAt?: number | undefined;
} & ApiGovVault;

export type CowVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: Address | null;
  tokenDecimals: number;
  depositTokenAddresses: string[];
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: Address;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: Address;
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
  type: 'cowcentrated';
  createdAt: number;
  retiredAt?: number | undefined;
} & ApiCowVault;

export type Erc4626Vault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: Address | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: Address;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: Address;
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
  type: 'erc4626';
  createdAt: number;
  retiredAt?: number | undefined;
} & ApiErc4626Vault;

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
