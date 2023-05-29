import Koa from 'koa';
import { getZapSupportByVault, getZapSupportByVaultDebug } from './zaps';
import { getProxiedQuote, getProxiedSwap } from './one-inch/proxy';
import { QuoteRequest, SwapRequest } from './one-inch/types';

export function vaultZapSupport(ctx: Koa.Context) {
  const data = getZapSupportByVault();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}

export function vaultZapSupportDebug(ctx: Koa.Context) {
  const data = getZapSupportByVaultDebug();
  if (data) {
    ctx.status = 200;
    ctx.body = data;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
}

export async function proxyOneInchSwap(ctx: Koa.Context) {
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.status;
  ctx.body = proxiedSwap.response ?? proxiedSwap.statusText;
}

export async function proxyOneInchQuote(ctx: Koa.Context) {
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.status;
  ctx.body = proxiedQuote.response ?? proxiedQuote.statusText;
}

function setNoCacheHeaders(ctx: Koa.Context) {
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  ctx.set('Pragma', 'no-cache');
  ctx.set('Expires', '0');
}
