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
  label: string;
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
  /** e.g. { "Beefy 0xDbaF4a5Ad4352adCDD2E914C1B1515E6F7451A82": 6.0934309620835405 } */
  aprs: { [label: string]: number };
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
