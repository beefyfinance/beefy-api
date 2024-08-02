import { AppChain } from '../../../../utils/chain';
import { CampaignType } from '../../types';

type MerklApiForwarder = {
  almAPR: number;
  almAddress: string;
  forwarderType: number;
  priority: number;
  sender: string;
  target: string;
  owner: string;
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
  creator: string;
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

export type CampaignTypeByChain = {
  [K in AppChain]?: CampaignType;
} & { default: CampaignType };

export type CampaignTypeSetting = CampaignType | CampaignTypeByChain;
