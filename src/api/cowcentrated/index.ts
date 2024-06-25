import { Context } from 'koa';
import { initCowVaultsMetaService } from './getCowVaultsMeta';
import { getCowPriceRanges, initCowPriceRangeService } from './getCowPriceRanges';
import {
  getCowBeefyMerklCampaignsByChain,
  getCowBeefyMerklCampaignsForChain,
  getCowMerklCampaignsByChain,
  getCowMerklCampaignsForChain,
  initCowMerklService,
} from './getCowMerkleCampaigns';
import { ApiChain, isApiChain } from '../../utils/chain';
import { isResultRejected } from '../../utils/promise';
import { getCowClmChains } from './getCowClms';
import {
  CacheOptions,
  sendBadRequest,
  sendNotFound,
  sendServiceUnavailable,
  sendSuccess,
} from '../../utils/koa';
import { getUnixTime } from 'date-fns';
import { minBy } from 'lodash';
import { ByChainMeta, ChainMeta } from '../../utils/CachedByChain';
import { Campaign } from './types';

export function initCowcentratedService() {
  Promise.allSettled([
    initCowVaultsMetaService(),
    initCowPriceRangeService(),
    initCowMerklService(),
  ])
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

export async function getCowcentratedPriceRanges(ctx: Context) {
  const priceRanges = getCowPriceRanges();
  if (priceRanges) {
    sendSuccess(ctx, priceRanges);
  } else {
    sendServiceUnavailable(ctx, 'Not available yet');
  }
}

/**
 * All merkl campaigns for each chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedAllMerklCampaigns = createMerklCampaignsHandler(
  getCowMerklCampaignsByChain
);

/**
 * Merkl campaigns for a specific chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedAllMerklCampaignsForChain = createMerklCampaignsForChainHandler(
  getCowMerklCampaignsForChain
);

/**
 * All merkl campaigns created by Beefy [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedBeefyMerklCampaigns = createMerklCampaignsHandler(
  getCowBeefyMerklCampaignsByChain
);

/**
 * Merkl campaigns created by Beefy for a specific chain [that target a pool one of our clm vaults is using]
 */
export const getCowcentratedBeefyMerklCampaignsForChain = createMerklCampaignsForChainHandler(
  getCowBeefyMerklCampaignsForChain
);

function createMerklCampaignsHandler(getByChain: () => ByChainMeta<Campaign[]>) {
  return async (ctx: Context) => {
    const data = getByChain();
    if (!data) {
      sendServiceUnavailable(ctx, 'Not available yet');
      return;
    }

    const perChain = Object.values(data);
    if (!perChain.length) {
      sendServiceUnavailable(ctx, 'Not available yet');
      return;
    }

    const minChain = minBy(perChain, d => d.freshUntil);
    sendSuccess(
      ctx,
      perChain.map(d => d.value).flat(),
      createCacheOptions(minChain.freshUntil, minChain.staleUntil)
    );
  };
}

function createMerklCampaignsForChainHandler(
  getForChain: (chainId: ApiChain) => ChainMeta<Campaign[]>
) {
  return async (ctx: Context) => {
    const chainId = ctx.params.chainId;
    if (!isApiChain(chainId)) {
      sendBadRequest(ctx, 'Invalid chain');
      return;
    }

    if (!getCowClmChains().includes(chainId)) {
      sendNotFound(ctx, 'No CLMs on this chain');
      return;
    }

    const data = getForChain(chainId);
    if (!data) {
      sendServiceUnavailable(ctx, 'Not available yet');
      return;
    }

    sendSuccess(ctx, data.value, createCacheOptions(data.freshUntil, data.staleUntil));
  };
}

export function createCacheOptions(freshUntil: number, staleUntil: number): CacheOptions {
  const options: CacheOptions = {
    control: 'public',
    maxAge: 0,
  };
  const now = getUnixTime(new Date());
  if (freshUntil < now) {
    return options;
  }

  const maxAge = freshUntil - now;
  options.maxAge = maxAge;
  options.sharedMaxAge = maxAge;

  if (staleUntil < now) {
    return options;
  }

  options.staleIfError = staleUntil - now - maxAge;

  return options;
}
