import { getCowPriceRanges, initCowDataService } from './getCowPriceRanges';
import { getCowMerklCampaignsForChain, initCowMerklService } from './getCowMerkleCampaigns';
import { isApiChain } from '../../utils/chain';
import { initCowVaultsMetaService } from './getCowVaultsMeta';
import { isResultRejected } from '../../utils/promise';

export function initCowcentratedService() {
  Promise.allSettled([initCowVaultsMetaService(), initCowDataService(), initCowMerklService()])
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

export const getCowcentratedPriceRanges = ctx => {
  const priceRanges = getCowPriceRanges();
  if (priceRanges) {
    ctx.status = 200;
    ctx.body = priceRanges;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};

export const getCowcentratedMerklCampaigns = ctx => {
  if (!isApiChain(ctx.params.chainId)) {
    ctx.status = 404;
    ctx.body = 'Invalid chain';
    return;
  }

  const campaigns = getCowMerklCampaignsForChain(ctx.params.chainId);
  if (!campaigns) {
    ctx.status = 500;
    ctx.body = 'Not available yet';
    return;
  }

  ctx.status = 200;
  ctx.body = campaigns;
};
