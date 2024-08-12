import { Campaign, MerklCampaign } from './types';

export function isMerklCampaign(campaign: Campaign): campaign is MerklCampaign {
  return campaign.providerId === 'merkl';
}
