import type { Context } from 'koa';
import { keysToObject } from '../../utils/array.ts';
import { SupportedChains } from '../../utils/chain.ts';
import { sendNotFound, sendSuccess } from '../../utils/koa.ts';
import { withChainId } from '../vaults/helpers.ts';
import { getPublicChainConfig } from './public-config.ts';

export const singleChain = withChainId(async (ctx, chainId) => {
  const config = getPublicChainConfig(chainId);
  if (!config) {
    sendNotFound(ctx, { error: 'Chain id not found' });
    return;
  }

  sendSuccess(ctx, config);
});

export const allChains = async (ctx: Context) => {
  const configs = keysToObject(SupportedChains, chainId => getPublicChainConfig(chainId));
  sendSuccess(ctx, configs);
};
