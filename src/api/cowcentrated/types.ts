import { Address, isAddress } from 'viem';
import { ApiChain } from '../../utils/chain';

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

type MerklApiForwarder = {
  almAPR: number;
  almAddress: Address;
  forwarderType: number;
  priority: number;
  sender: Address;
  target: Address;
  owner: Address;
  type: number;
};

export type MerklApiCampaign = {
  chainId: number;
  campaignId: string;
  creator: Address;
  startTimestamp: number;
  endTimestamp: number;
  /** supposed to be an address but some have extra space on end */
  mainParameter: string;
  forwarders: MerklApiForwarder[];
};

export type MerklApiCampaignsResponse = {
  [chainId: string]: {
    [poolTypeId: string]: {
      [campaignId: string]: MerklApiCampaign;
    };
  };
};

type CampaignVault = {
  id: string;
  address: string;
  apr: number;
};

export type BeefyCampaignType = 'test' | 'arb-ltipp' | 'op-gov-fund' | 'other';
export type ExternalCampaignType = 'external';
export type CampaignType = BeefyCampaignType | ExternalCampaignType;

export type CampaignTypeByChain = {
  [K in ApiChain]?: CampaignType;
} & { default: CampaignType };

export type CampaignTypeSetting = CampaignType | CampaignTypeByChain;

export type Campaign = {
  campaignId: string;
  startTimestamp: number;
  endTimestamp: number;
  chainId: ApiChain;
  poolAddress: string;
  type: CampaignType;
  fetchedTimestamp: number;
  vaults: CampaignVault[];
};
