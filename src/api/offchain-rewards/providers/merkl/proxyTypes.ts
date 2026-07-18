import type { MerklApiCampaignStatus } from './types.ts';

// Mirrors beefy-merkl-api's SlimOpportunity / SlimCampaign response shapes.
// Keep in sync with that service's src/api/read-store.ts + src/api/schemas/response.ts.

export interface MerklProxyRewardToken {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  isTest: boolean;
}

export interface MerklProxyAprBreakdown {
  identifier: string;
  type: string;
  value: number;
}

export interface MerklProxyAprRecord {
  cumulated: number;
  timestamp: string;
  breakdowns: MerklProxyAprBreakdown[];
}

export interface MerklProxyCampaign {
  id: string;
  rootCampaignId: string | null;
  campaignId: string;
  type: string;
  subType: number | null;
  apr: number | null;
  startTimestamp: number;
  endTimestamp: number;
  rewardToken: MerklProxyRewardToken;
  campaignStatus: MerklApiCampaignStatus;
  creator: { address: string };
  computeChainId: number;
  distributionChainId: number;
}

export interface MerklProxyOpportunity {
  chainId: number;
  id: string;
  identifier: string;
  explorerAddress: string | null;
  type: string;
  mainProtocol: string | null;
  chain: { id: number; name: string };
  name: string;
  status: string;
  apr: number;
  tvl: number;
  dailyRewards: number;
  maxApr: number | null;
  aprRecord: MerklProxyAprRecord | null;
  campaigns?: MerklProxyCampaign[]; // present only when fetched with ?campaigns=true
}
