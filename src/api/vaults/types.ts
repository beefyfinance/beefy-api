import BigNumber from 'bignumber.js';
import { ApiChain, AppChain } from '../../utils/chain';
import { Address } from 'viem';

type VaultRisksConfig = {
  /** when risks were last updated, defaults to vault.createdAt */
  updatedAt?: number;
  complex: boolean;
  curated: boolean;
  notAudited: boolean;
  notBattleTested: boolean;
  notCorrelated: boolean;
  notTimelocked: boolean;
  notVerified: boolean;
  synthAsset: boolean;
};

type ZapStrategyConfig = {
  strategyId: string;
};

/** Added to all vault configs by API */
type ApiCommonVault = {
  /** Same as {network} except for harmony->one */
  chain: ApiChain;
  /** @deprecated use type === 'gov' */
  isGovVault?: boolean;
  /** Test vault only visible in API, not app */
  isTest?: boolean;
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
  risks: VaultRisksConfig;
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  type: 'standard';
  createdAt: number;
  retiredAt?: number | undefined;
  zaps?: ZapStrategyConfig[];
} & ApiStandardVault;

export type GovVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress: Address;
  tokenDecimals: number;
  tokenProviderId?: string;
  version?: number;
  earnContractAddress: string;
  earnedToken: string; // multi gov vaults have it as the receiptToken
  earnOracleId?: string; //multi gov vault receiptToken
  earnedTokenAddress?: string; // only missing in multi gov vaults
  earnedTokenDecimals?: number | null; // only missing in multi gov vaults
  earnedTokenAddresses?: string[]; // only available in multi gov vaults
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets: string[];
  risks: VaultRisksConfig;
  strategyTypeId: string;
  type: 'gov';
  network: AppChain;
  createdAt: number;
  retiredAt?: number | undefined;
  zaps?: ZapStrategyConfig[];
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
  risks: VaultRisksConfig;
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  type: 'cowcentrated';
  createdAt: number;
  retiredAt?: number | undefined;
  zaps?: ZapStrategyConfig[];
  feeTier?: string;
  tickSpacing: number;
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
  risks: VaultRisksConfig;
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  type: 'erc4626';
  createdAt: number;
  retiredAt?: number | undefined;
  zaps?: ZapStrategyConfig[];
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
