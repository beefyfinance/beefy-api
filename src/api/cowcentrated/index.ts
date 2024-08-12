import { Context } from 'koa';
import { initCowVaultsMetaService } from './getCowVaultsMeta';
import { getCowPriceRanges, initCowPriceRangeService } from './getCowPriceRanges';
import { isResultRejected } from '../../utils/promise';
import { sendServiceUnavailable, sendSuccess } from '../../utils/koa';
import { getCampaignsForChainProviderWithMeta } from '../offchain-rewards';
import { isMerklCampaign } from '../offchain-rewards/typeguards';
import { pick } from 'lodash';

export function initCowcentratedService() {
  Promise.allSettled([initCowVaultsMetaService(), initCowPriceRangeService()])
    .then(results => {
      const failures = results.filter(isResultRejected);
      if (failures.length) {
        console.error(`> [CLM Service] ${failures.length} services failed to initialize`, failures);
      }
    })
    .catch(err => {
      console.error('> [CLM Service] Initialization failed', err);
    });
}

export async function handleCowcentratedPriceRanges(ctx: Context) {
  const priceRanges = getCowPriceRanges();
  if (priceRanges) {
    sendSuccess(ctx, priceRanges);
  } else {
    sendServiceUnavailable(ctx, 'Not available yet');
  }
}

export async function handleCowcentratedLTIPPCampaignsForDune(ctx: Context) {
  const result = await getCampaignsForChainProviderWithMeta('arbitrum', 'merkl');
  if (!result || result.lastUpdated === 0) {
    sendServiceUnavailable(ctx, 'Not available yet');
  } else {
    const campaigns = result.campaigns
      .filter(isMerklCampaign)
      .filter(c => c.type === 'arb-ltipp')
      .map(c => pick(c, 'campaignId'));
    sendSuccess(ctx, campaigns, {
      maxAge: 5 * 60,
    });
  }
}
