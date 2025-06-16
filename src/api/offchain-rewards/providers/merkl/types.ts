import { AppChain } from '../../../../utils/chain';
import { CampaignType } from '../../types';

type MerklApiForwarder = {
  token?: string;
  sender: string;
  priority: number;
  forwarderType: number;
  type?: number;
  target?: string;
  owner?: string;
};

export type MerklApiCampaignType =
  | 'INVALID'
  | 'ERC20'
  | 'CLAMM'
  | 'ERC20_SNAPSHOT'
  | 'JSON_AIRDROP'
  | 'SILO'
  | 'RADIANT'
  | 'MORPHO'
  | 'DOLOMITE'
  | 'BADGER'
  | 'COMPOUND'
  | 'AJNA'
  | 'EULER'
  | 'UNISWAP_V4'
  | 'ION'
  | 'EIGENLAYER'
  | 'ERC20TRANSFERS'
  | 'ERC20LOGPROCESSOR'
  | 'ERC20REBASELOGPROCESSOR'
  | 'VEST'
  | 'ERC20_FIX_APR'
  | 'HYPERDRIVELOGPROCESSOR'
  | 'HYPERDRIVELOGFIXPROCESSOR';

export type MerklApiCampaignParams = {
  amm?: number;
  url?: string;
  hooks?: any[];
  token0?: string;
  token1?: string;
  ammAlgo?: number;
  poolFee?: string;
  duration?: number;
  blacklist?: string[];
  whitelist?: string[];
  forwarders: MerklApiForwarder[];
  weightFees?: number;
  poolAddress?: string;
  symbolToken0?: string;
  symbolToken1?: string;
  weightToken0?: number;
  weightToken1?: number;
  decimalsToken0?: number;
  decimalsToken1?: number;
  symbolRewardToken: string;
  decimalsRewardToken: number;
  isOutOfRangeIncentivized?: boolean;
  targetToken?: string;
  symbolTargetToken?: string;
  decimalsTargetToken?: number;
  jsonUrl?: string;
  boostedReward?: number;
  boostedAddress?: string;
};

export interface MerklApiChain {
  id: number;
  name: string;
  icon: string;
}

export interface MerklApiToken {
  id: string;
  name: string;
  chainId: number;
  address: string;
  decimals: number;
  icon: string;
  verified: boolean;
  isTest: boolean;
  isPoint: boolean;
  isNative: boolean;
  price?: number | null;
  symbol: string;
}

export interface MerklApiCampaignStatus {
  campaignId: string;
  computedUntil: number;
  processingStarted: number;
  status: string;
  error: string;
  details: string | Record<string, unknown>; // string = "{json encoded object}" or "null"
}

export type MerklApiCampaign = {
  id: string;
  computeChainId: number;
  distributionChainId: number;
  campaignId: string;
  type: MerklApiCampaignType;
  distributionType: string;
  subType: number;
  rewardTokenId: string;
  amount: string;
  opportunityId: string;
  startTimestamp: number;
  endTimestamp: number;
  creator: {
    address: string;
    tags: string[];
    creatorId: string;
  };
  params: MerklApiCampaignParams;
  chain: MerklApiChain;
  rewardToken: MerklApiToken;
  distributionChain: MerklApiChain;
  campaignStatus: MerklApiCampaignStatus;
};

export type MerklApiProtocol = {
  id: string;
  tags: string[];
  name: string;
  description: string;
  url: string;
  icon: string;
};

export type MerklApiAprBreakdown = {
  id: number;
  identifier: string;
  type: string;
  value: number;
  aprRecordId: string;
};

export type MerklApiApr = {
  cumulated: number;
  timestamp: string;
  breakdowns: MerklApiAprBreakdown[];
};

export type MerklApiTvlBreakdown = {
  id: number;
  identifier: string;
  type: string;
  value: number;
  tvlRecordId: string;
};

export type MerklApiTvl = {
  id: string;
  total: number;
  timestamp: string;
  breakdowns: MerklApiTvlBreakdown[];
};

export type MerklApiRewardsBreakdown = {
  token: MerklApiToken;
  amount: string;
  id: number;
  value: number;
  campaignId: string;
  dailyRewardsRecordId: string;
};

export type MerklApiRewards = {
  id: string;
  total: number;
  timestamp: string;
  breakdowns: MerklApiRewardsBreakdown[];
};

export type MerklApiOpportunityStatus = 'LIVE' | 'SOON' | 'PAST';

export type MerklApiOpportunityWithCampaigns = {
  chainId: number;
  type: string;
  identifier: string;
  name: string;
  status: MerklApiOpportunityStatus;
  action: string;
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: string[];
  id: string;
  tokens: MerklApiToken[];
  chain: MerklApiChain;
  protocol?: MerklApiProtocol;
  aprRecord: MerklApiApr;
  campaigns: MerklApiCampaign[];
  tvlRecord?: MerklApiTvl;
  rewardsRecord?: MerklApiRewards;
};

export type MerklApiOpportunitiesRequest = {
  page: number;
  items: number;
  chainId: number;
  type: MerklApiCampaignType[];
};

export type MerklApiOpportunitiesParams = {
  [K in keyof MerklApiOpportunitiesRequest]: string;
} & {
  status: MerklApiOpportunityStatus;
  test: 'false';
  campaigns: 'true';
};

export type MerklApiCampaignsResponse = Array<MerklApiCampaign>;

export type MerklApiOpportunitiesWithCampaignsResponse = Array<MerklApiOpportunityWithCampaigns>;

export type CampaignTypeByChain = {
  [K in AppChain]?: CampaignType;
} & { default: CampaignType };

export type CampaignTypeSetting = CampaignType | CampaignTypeByChain;
