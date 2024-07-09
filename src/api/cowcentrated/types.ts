import { Address, isAddress } from 'viem';
import { ApiChain, AppChain } from '../../utils/chain';
import { isNonEmptyArray, NonEmptyArray } from '../../utils/array';

type JsonCowClm = {
  beta?: boolean;
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
      address: string;
    }[];
  };
};

export type CowClm = {
  beta: boolean | undefined;
  address: Address;
  lpAddress: Address;
  tokens: [Address, Address];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
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
  return reward.id >= 0 && reward.oracleId && reward.decimals >= 0 && isAddress(reward.address);
}

function isValidCowClmRewardPoolConfig(
  rewardPool: JsonCowClm['rewardPool']
): rewardPool is CowRewardPool {
  return (
    rewardPool &&
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
    ((!clm.rewardPool && clm.beta) || isValidCowClmRewardPoolConfig(clm.rewardPool))
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

type MerklApiCampaignParameters = {
  symbolRewardToken: string;
  decimalsRewardToken: number;
};

export type MerklApiCampaign = {
  chainId: number;
  computeChainId?: number;
  campaignId: string;
  creator: Address;
  startTimestamp: number;
  endTimestamp: number;
  rewardToken: string;
  /** supposed to be an address but some have extra space on end */
  mainParameter: string;
  forwarders: MerklApiForwarder[];
  campaignParameters: MerklApiCampaignParameters;
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

export type CampaignRewardToken = {
  address: string;
  symbol: string;
  decimals: number;
  chainId: AppChain;
};

export type Campaign = {
  campaignId: string;
  startTimestamp: number;
  endTimestamp: number;
  chainId: AppChain;
  poolAddress: string;
  rewardToken: CampaignRewardToken;
  type: CampaignType;
  vaults: CampaignVault[];
};

export type CampaignForVault = Omit<Campaign, 'vaults'> & CampaignVault;
