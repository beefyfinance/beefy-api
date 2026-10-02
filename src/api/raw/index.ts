import type { Context } from 'koa';
import { parseRawChain, type RawChain } from '../../utils/chain.ts';
import { type KoaCallback, sendNotFound, sendSuccess, withErrorHandling } from '../../utils/koa.ts';
import { getAllRawBoosts, getAllRawVaults, getRawBoosts, getRawVaults } from './getRawConfigs.ts';

function withRawChain(cb: (ctx: Context, chain: RawChain) => Promise<void>): KoaCallback {
  return withErrorHandling(async ctx => {
    const chain = parseRawChain(ctx.params.chainId);
    if (!chain) {
      sendNotFound(ctx, 'chainId not found');
      return;
    }

    await cb(ctx, chain);
  });
}

export const rawVaults = withErrorHandling(async ctx => sendSuccess(ctx, getAllRawVaults()));

export const chainRawVaults = withRawChain(async (ctx, chain) => sendSuccess(ctx, getRawVaults(chain)));

export const rawBoosts = withErrorHandling(async ctx => sendSuccess(ctx, getAllRawBoosts()));

export const chainRawBoosts = withRawChain(async (ctx, chain) => sendSuccess(ctx, getRawBoosts(chain)));
