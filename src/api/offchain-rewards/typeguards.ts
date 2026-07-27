import type { Campaign, MerklCampaign, UpdateResolved, UpdateResult } from './types.ts';

export function isMerklCampaign(campaign: Campaign): campaign is MerklCampaign {
  return campaign.providerId === 'merkl';
}

export function isUpdateResolved(result: UpdateResult): result is UpdateResolved {
  return result.status === 'resolved';
}
