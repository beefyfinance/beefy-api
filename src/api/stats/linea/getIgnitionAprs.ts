import type { Address } from 'viem';

type CampaignInfo = {
  protocol: string;
  poolAddr: Address;
  campaignId: string;
  lastWeekRewards: number;
  lastWeekApr: `${number}%`;
  tvl: number;
};

type CampaignInfoResponseSuccess = {
  err: null;
  campaignInfo: CampaignInfo[];
};

type CampaignInfoResponseError = {
  err: string;
};

type CampaignInfoResponse = CampaignInfoResponseSuccess | CampaignInfoResponseError;

export type IgnitionAprs = Record<Address, number>;

function isResponseSuccess(response: CampaignInfoResponse): response is CampaignInfoResponseSuccess {
  return response.err === null;
}

export const getIgnitionAprs = (_: string) => ({});
