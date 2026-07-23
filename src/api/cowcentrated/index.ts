import type { Context } from 'koa';
import { pick } from 'lodash-es';
import { sendServiceUnavailable, sendSuccess } from '../../utils/koa.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { isResultRejected } from '../../utils/promise.ts';
import { getCampaignsForChainProviderWithMeta } from '../offchain-rewards/index.ts';
import { isMerklCampaign } from '../offchain-rewards/typeguards.ts';
import { getCowPriceRanges, initCowPriceRangeService } from './getCowPriceRanges.ts';
import { initCowVaultsMetaService } from './getCowVaultsMeta.ts';

const logger = getLoggerFor({ module: 'clm' });

export function initCowcentratedService() {
  Promise.allSettled([initCowVaultsMetaService(), initCowPriceRangeService()])
    .then(results => {
      const failures = results.filter(isResultRejected);
      if (failures.length) {
        logger.error({ count: failures.length, failures }, 'services failed to initialize');
      }
    })
    .catch(err => {
      logger.error({ err }, 'initialization failed');
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
