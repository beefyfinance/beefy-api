import { Address, isAddress } from 'viem';
import { isNonEmptyArray, NonEmptyArray } from '../../utils/array';

type JsonCowClm = {
  address: string;
  lpAddress: string;
  tokens: string[];
  tokenOracleIds: string[];
  decimals: number[];
  oracleId: string;
  rewardPool?: {
    address: string;
    oracleId: string;
    rewards?: {
      id: number;
      oracleId: string;
      decimals: number;
    }[];
  };
};

export type CowClm = {
  address: Address;
  lpAddress: Address;
  tokens: [Address, Address];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
};

export type CowRewardPoolReward = {
  id: number;
  oracleId: string;
  decimals: number;
};

export type CowRewardPool = {
  address: Address;
  oracleId: string;
  /** manual reward mapper, if undefined will read from contract/use addressbook */
  rewards?: NonEmptyArray<CowRewardPoolReward>;
  /** whether the reward pool is compounding all merkl rewards */
  merkl?: boolean;
};

export type CowClmWithRewardPool = CowClm & {
  rewardPool: CowRewardPool;
};

export type AnyCowClm = CowClm | CowClmWithRewardPool;

export function isCowClmWithRewardPool(clm: AnyCowClm): clm is CowClmWithRewardPool {
  return 'rewardPool' in clm && clm.rewardPool !== undefined;
}

function isValidCowRewardPoolRewardConfig(
  reward: NonNullable<NonNullable<JsonCowClm['rewardPool']>['rewards']>[number]
): reward is CowRewardPoolReward {
  return reward.id >= 0 && reward.oracleId && reward.decimals >= 0;
}

function isValidCowClmRewardPoolConfig(
  rewardPool: NonNullable<JsonCowClm>['rewardPool']
): rewardPool is CowRewardPool {
  return (
    rewardPool.oracleId &&
    isAddress(rewardPool.address) &&
    (!rewardPool.rewards ||
      (isNonEmptyArray(rewardPool.rewards) &&
        rewardPool.rewards.every(isValidCowRewardPoolRewardConfig)))
  );
}

function isValidCowClmConfig(clm: JsonCowClm): clm is AnyCowClm {
  return (
    clm.tokens.length === 2 &&
    clm.tokenOracleIds.length === 2 &&
    clm.decimals.length === 2 &&
    isAddress(clm.address) &&
    isAddress(clm.lpAddress) &&
    clm.tokens.every(isAddress) &&
    (!clm.rewardPool || isValidCowClmRewardPoolConfig(clm.rewardPool))
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

export type AnyCowClmMeta = CowClmMeta | CowClmWithRewardPoolMeta;

export function isCowClmWithRewardPoolMeta(clm: AnyCowClmMeta): clm is CowClmWithRewardPoolMeta {
  return 'rewardPool' in clm && clm.rewardPool !== undefined;
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
