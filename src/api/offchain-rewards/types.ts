import { AppChain } from '../../utils/chain';
import { Address } from 'viem';

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
  type: 'standard' | 'gov' | 'cowcentrated';
  chainId: AppChain;
};

export type CampaignVault = Vault & {
  apr: number;
};

export type BeefyCampaignType = 'test' | 'arb-ltipp' | 'op-gov-fund' | 'other';
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
