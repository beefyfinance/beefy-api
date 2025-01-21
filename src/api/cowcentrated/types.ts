import { Address, isAddress } from 'viem';
import { ApiChain } from '../../utils/chain';
import { isNonEmptyArray, NonEmptyArray } from '../../utils/array';
import { Token } from '../../../packages/address-book/src/types/token';
import { providers } from './providers';

export type JsonCowClm = {
  beta?: boolean;
  address: string;
  lpAddress: string;
  tokens: string[];
  tokenOracleIds: string[];
  decimals: number[];
  oracleId: string;
  providerId?: string;
  rewardPool?: {
    address: string;
    oracleId: string;
    rewards?: {
      id: number;
      oracleId: string;
      decimals: number;
      address: string;
    }[];
  };
  vault?: {
    address: string;
    oracleId: string;
  };
};

export type CowProviderTradingRewardTokens = {
  [K in ApiChain]?: ReadonlyArray<Token>;
};

export type CowProvider = {
  poolTradingRewardTokens?: CowProviderTradingRewardTokens;
};

export type CowClm = {
  beta: boolean | undefined;
  address: Address;
  lpAddress: Address;
  tokens: [Address, Address];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
  providerId?: string;
};

export type CowRewardPoolReward = {
  id: number;
  address: Address;
  oracleId: string;
  decimals: number;
};

export type CowRewardPool = {
  address: Address;
  oracleId: string;
  /** manual reward mapper, if undefined will read from contract/use addressbook */
  rewards?: NonEmptyArray<CowRewardPoolReward>;
};

export type CowClmWithRewardPool = CowClm & {
  rewardPool: CowRewardPool;
};

export type CowVault = {
  address: Address;
  oracleId: string;
  excludeMerkl?: boolean;
};

export type CowClmWithVault = CowClmWithRewardPool & {
  vault: CowVault;
};

export type AnyCowClm = CowClm | CowClmWithRewardPool | CowClmWithVault;

export function isCowClmWithRewardPool(clm: AnyCowClm): clm is CowClmWithRewardPool {
  return 'rewardPool' in clm && clm.rewardPool !== undefined;
}

export function isCowClmWithVault(clm: AnyCowClm): clm is CowClmWithVault {
  return isCowClmWithRewardPool(clm) && 'vault' in clm && clm.vault !== undefined;
}

function isValidCowRewardPoolRewardConfig(
  reward: NonNullable<NonNullable<JsonCowClm['rewardPool']>['rewards']>[number]
): reward is CowRewardPoolReward {
  return reward.id >= 0 && reward.oracleId && reward.decimals >= 0 && isAddress(reward.address);
}

function isValidCowClmRewardPoolConfig(rewardPool: JsonCowClm['rewardPool']): rewardPool is CowRewardPool {
  return (
    rewardPool &&
    rewardPool.oracleId &&
    isAddress(rewardPool.address) &&
    (!rewardPool.rewards ||
      (isNonEmptyArray(rewardPool.rewards) && rewardPool.rewards.every(isValidCowRewardPoolRewardConfig)))
  );
}

function isValidCowClmVaultConfig(vault: JsonCowClm['vault']): vault is CowVault {
  return vault && vault.oracleId && isAddress(vault.address);
}

function isValidCowProviderId(id: string): boolean {
  return id in providers;
}

function isValidCowClmConfig(clm: JsonCowClm): clm is AnyCowClm {
  return (
    (clm.tokens.length === 2 &&
      clm.tokenOracleIds.length === 2 &&
      clm.decimals.length === 2 &&
      isAddress(clm.address) &&
      isAddress(clm.lpAddress) &&
      clm.tokens.every(isAddress) &&
      // no reward pool if beta clm, or valid reward pool
      ((!clm.rewardPool && clm.beta) || isValidCowClmRewardPoolConfig(clm.rewardPool)) &&
      // no vault, or reward pool and valid vault
      (!clm.vault || (clm.rewardPool && isValidCowClmVaultConfig(clm.vault))) &&
      // no provider, or valid provider
      !clm.providerId) ||
    isValidCowProviderId(clm.providerId)
  );
}

export function validateCowClms(clms: JsonCowClm[]): AnyCowClm[] {
  if (!clms.every(isValidCowClmConfig)) {
    throw new Error('Invalid cow CLMs');
  }

  return clms;
}

export type CowMeta = {
  apr: string;
  apy: string;
  currentPrice: string;
  priceRangeMin: string;
  priceRangeMax: string;
};

export type CowClmMeta = CowClm & CowMeta;

export type CowClmWithRewardPoolMeta = CowClmWithRewardPool & CowMeta;
export type CowClmWithVaultMeta = CowClmWithVault & CowMeta;

export type AnyCowClmMeta = CowClmMeta | CowClmWithRewardPoolMeta | CowClmWithVaultMeta;

export function isCowClmWithRewardPoolMeta(clm: AnyCowClmMeta): clm is CowClmWithRewardPoolMeta {
  return 'rewardPool' in clm && clm.rewardPool !== undefined;
}

export function isCowClmWithVaultMeta(clm: AnyCowClmMeta): clm is CowClmWithVaultMeta {
  return isCowClmWithRewardPoolMeta(clm) && 'vault' in clm && clm.vault !== undefined;
}

export type CowClmsMeta = {
  updatedAt: number;
  vaults: AnyCowClmMeta[];
};

export type ClmApiVault = {
  vaultAddress: Address;
  priceOfToken0InToken1: string;
  priceRangeMin1: string;
  priceRangeMax1: string;
  apr: string;
  apy: string;
};

export type ClmApiVaultsResponse = ClmApiVault[];

export function isClmApiVault(data: any): data is ClmApiVault {
  return (
    isAddress(data.vaultAddress) &&
    typeof data.priceOfToken0InToken1 === 'string' &&
    typeof data.priceRangeMin1 === 'string' &&
    typeof data.priceRangeMax1 === 'string' &&
    typeof data.apr === 'string' &&
    typeof data.apy === 'string'
  );
}

export function isClmApiVaultsResponse(data: any): data is ClmApiVaultsResponse {
  return Array.isArray(data) && data.every(isClmApiVault);
}
