import { getCowcentratedData } from './getCowcentratedData';
import { getCowMerklCampaignsForChain } from './getMerkleCampaigns';
import { isApiChain } from '../../utils/chain';

export const getCowcentratedVaultData = ctx => {
  const chainTokens = getCowcentratedData();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
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
