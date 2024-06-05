import { Address, isAddress } from 'viem';

type JsonCowPool = {
  address: string;
  lpAddress: string;
  tokens: string[];
  tokenOracleIds: string[];
  decimals: number[];
  oracleId: string;
};

export type CowPool = {
  address: Address;
  lpAddress: Address;
  tokens: [Address, Address];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
};

function isCowPool(pool: JsonCowPool): pool is CowPool {
  return (
    pool.tokens.length === 2 &&
    pool.tokenOracleIds.length === 2 &&
    pool.decimals.length === 2 &&
    isAddress(pool.address) &&
    isAddress(pool.lpAddress) &&
    pool.tokens.every(isAddress)
  );
}

function areCowPools(pools: JsonCowPool[]): pools is CowPool[] {
  return pools.every(isCowPool);
}

export function validateCowPools(pools: JsonCowPool[]): CowPool[] {
  if (!areCowPools(pools)) {
    throw new Error('Invalid pools');
  }

  return pools;
}

export type CowVaultMeta = CowPool & {
  apr: string;
  apy: string;
  currentPrice: string;
  priceRangeMin: string;
  priceRangeMax: string;
};

export type CowVaultsMeta = {
  updatedAt: number;
  vaults: CowVaultMeta[];
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
