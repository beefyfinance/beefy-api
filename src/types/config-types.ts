import BigNumber from 'bignumber.js';
import { ChainName } from './Chain';

/**
 * Type extracted from https://github.com/beefyfinance/beefy-v2/blob/c39c5066b9e749578639db9f9980d6f711065a00/src/features/data/apis/config-types.ts#L7
 * This represents the configuration type of any vault in this repo
 * We fetch the json from github directly so it make sense to use their type too
 */
export interface VaultConfig {
  id: string;
  logo?: string | null;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number | null;
  earnContractAddress: string;
  oracle: string; // 'tokens' | 'lp';
  oracleId: string;
  status: string; // 'active' | 'eol' | 'paused';
  platformId: string;
  assets?: string[];
  risks?: string[] | null;
  strategyTypeId: string;
  withdrawalFee?: string | null;
  network: string;
  excluded?: string | null;
  isGovVault?: boolean | null;
  callFee?: number | null;
  createdAt?: number | null;
  addLiquidityUrl?: string | null;
  buyTokenUrl?: string | null;
  retireReason?: string | null;
  pauseReason?: string | null;
  removeLiquidityUrl?: string | null;
  depositFee?: string | null;
  refund?: boolean | null;
  updatedFees?: boolean | null;
  refundContractAddress?: string | null;
  showWarning?: boolean | null;
  warning?: string | null;
}

/**
 * These types represent how the current code works with the config types and does not reflect what we ultimately want as implementation
 * Current implementation updates the vault config in place
 * Ideally, the config object never gets updated in place
 */
export type VaultWithChain = VaultConfig & { chain: ChainName };
export type VaultWithChainAndStrategy = VaultWithChain & { strategy: string };
export type VaultWithChainAndStrategyAndLastHarvest = VaultWithChainAndStrategy & {
  lastHarvest: number;
};
export type VaultConfigExtended = VaultWithChainAndStrategy & {
  pricePerFullShare: BigNumber;
};
