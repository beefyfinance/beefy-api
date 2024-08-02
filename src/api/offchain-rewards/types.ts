import { AppChain } from '../../utils/chain';
import { Address } from 'viem';

export type ProviderId = 'merkl' | 'stellaswap';

export type RewardToken = {
  address: Address;
  symbol: string;
  decimals: number;
  chainId: AppChain;
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
  active: boolean;
  vaults: CampaignVault[];
  type: CampaignType;
} & TExtra;

export type MerklCampaign = MakeCampaign<
  'merkl',
  {
    campaignId: string;
    startTimestamp: number;
    endTimestamp: number;
  }
>;

export type StellaswapCampaign = MakeCampaign<'stellaswap'>;

export type CampaignByProvider = {
  merkl: MerklCampaign;
  stellaswap: StellaswapCampaign;
};

// export type Campaign = CampaignByProvider[ProviderId];
export type Campaign = MerklCampaign | StellaswapCampaign;

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
