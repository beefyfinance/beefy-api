import { AppChain } from '../../utils/chain';
import { Address } from 'viem';
import { MerklApiCampaignStatus } from './providers/merkl/types';

export type ProviderId = 'merkl' | 'stellaswap';

export type RewardToken = {
  address: Address;
  symbol: string;
  decimals: number;
  chainId: AppChain;
  type: 'erc20' | 'native';
};

export type Vault = {
  id: string;
  address: Address;
  poolAddress: Address;
  /** @dev this does not match vault config */
  type: 'standard' | 'gov' | 'cowcentrated' | 'cowcentrated-pool' | 'cowcentrated-vault';
  chainId: AppChain;
};

export type CampaignVault = Vault & {
  apr: number;
};

export type BeefyCampaignType = 'test' | 'arb-ltipp' | 'op-gov-fund' | 'zap-v3' | 'mode-grant' | 'other';
export type ExternalCampaignType = 'external';
export type CampaignType = BeefyCampaignType | ExternalCampaignType;

type MakeCampaign<TProvider extends ProviderId, TExtra extends object = {}> = {
  providerId: TProvider;
  id: string;
  chainId: AppChain;
  poolAddress: Address;
  rewardToken: RewardToken;
  vaults: CampaignVault[];
  type: CampaignType;
  startTimestamp: number;
  endTimestamp: number;
  active: boolean;
} & TExtra;

export type MerklCampaign = MakeCampaign<
  'merkl',
  {
    campaignId: string;
    opportunityId: string;
    campaignStatus?: Pick<MerklApiCampaignStatus, 'computedUntil' | 'processingStarted' | 'status'>;
  }
>;

export type StellaSwapCampaign = MakeCampaign<
  'stellaswap',
  {
    rewardId: number;
    rewarderAddress: Address;
    isPaused: boolean;
  }
>;

export type CampaignByProvider = {
  merkl: MerklCampaign;
  stellaswap: StellaSwapCampaign;
};

// export type Campaign = CampaignByProvider[ProviderId];
export type Campaign = MerklCampaign | StellaSwapCampaign;

export interface IOffchainRewardProvider<T extends Campaign = Campaign> {
  readonly id: T['providerId'];
  supportsChain(chainId: AppChain): boolean;
  supportsVault(vault: Vault): boolean;
  getCampaigns(chainId: AppChain, vaults: Vault[]): Promise<T[]>;
  isActive(campaign: T, unixTime: number): boolean;
}

export type CampaignsWithMeta = {
  lastUpdated: number;
  campaigns: ReadonlyArray<Campaign>;
};
