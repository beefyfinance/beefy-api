import { Context } from 'koa';
import { ApiChain, fromChainNumber, isApiChain, isAppChain, toApiChain } from '../../utils/chain';
import { KoaCallback, sendNotFound, withErrorHandling } from '../../utils/koa';

export function getChainIdParam(ctx: Context): ApiChain | undefined {
  const raw = ctx.params.chainId;
  if (!raw) {
    return undefined;
  }

  if (isApiChain(raw)) {
    return raw;
  }

  if (isAppChain(raw)) {
    return toApiChain(raw);
  }

  const numeric = parseInt(raw, 10);
  if (isFinite(numeric) && !isNaN(numeric)) {
    return fromChainNumber(numeric);
  }

  return undefined;
}

export function withChainId(cb: (ctx: Context, chainId: ApiChain) => Promise<void>): KoaCallback {
  return withErrorHandling(async ctx => {
    const chainId = getChainIdParam(ctx);
    if (!chainId) {
      sendNotFound(ctx, 'chainId not found');
      return;
    }

    await cb(ctx, chainId);
  });
}
