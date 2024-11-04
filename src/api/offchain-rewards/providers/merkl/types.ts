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

export enum MerklApiCampaignType {
  ERC20 = 1,
  ConcentratedLiquidity,
  ERC20Snapshot,
  Airdrops,
  Silo,
  Radiant,
  Morpho,
  Dolomite,
  Badger,
  CompoundV2,
  Anja,
  EulerFinance,
}

export type MerklApiCampaign = {
  chainId: number;
  computeChainId?: number;
  campaignType: MerklApiCampaignType;
  campaignId: string;
  creator: string;
  startTimestamp: number;
  endTimestamp: number;
  rewardToken: string;
  /** supposed to be an address but some have extra space on end */
  mainParameter: string;
  forwarders: MerklApiForwarder[];
  campaignParameters: MerklApiCampaignParameters;
  apr: number; // used on erc20 campaigns on standard vaults
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
