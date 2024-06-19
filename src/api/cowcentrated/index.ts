import { getCowPriceRanges, initCowDataService } from './getCowPriceRanges';
import {
  getCowBeefyMerklCampaignsByChain,
  getCowBeefyMerklCampaignsForChain,
  getCowMerklCampaignsByChain,
  getCowMerklCampaignsForChain,
  initCowMerklService,
} from './getCowMerkleCampaigns';
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

/**
 * All merkl campaigns for each chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedAllMerklCampaigns = ctx => {
  const campaigns = getCowMerklCampaignsByChain();
  if (!campaigns) {
    ctx.status = 500;
    ctx.body = 'Not available yet';
    return;
  }

  ctx.status = 200;
  ctx.body = Object.values(campaigns).flat();
};

/**
 * Merkl campaigns for a specific chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedAllMerklCampaignsForChain = ctx => {
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

/**
 * All merkl campaigns created by Beefy [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedBeefyMerklCampaigns = ctx => {
  const campaigns = getCowBeefyMerklCampaignsByChain();
  if (!campaigns) {
    ctx.status = 500;
    ctx.body = 'Not available yet';
    return;
  }

  ctx.status = 200;
  ctx.body = Object.values(campaigns).flat();
};

/**
 * Merkl campaigns created by Beefy for a specific chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedBeefyMerklCampaignsForChain = ctx => {
  if (!isApiChain(ctx.params.chainId)) {
    ctx.status = 404;
    ctx.body = 'Invalid chain';
    return;
  }

  const campaigns = getCowBeefyMerklCampaignsForChain(ctx.params.chainId);
  if (!campaigns) {
    ctx.status = 500;
    ctx.body = 'Not available yet';
    return;
  }

  ctx.status = 200;
  ctx.body = campaigns;
};
