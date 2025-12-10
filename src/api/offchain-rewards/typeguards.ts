import { Campaign, MerklCampaign, UpdateResolved, UpdateResult } from './types';

export function isMerklCampaign(campaign: Campaign): campaign is MerklCampaign {
  return campaign.providerId === 'merkl';
}

export function isUpdateResolved(result: UpdateResult): result is UpdateResolved {
  return result.status === 'resolved';
}
