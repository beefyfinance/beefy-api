import type Koa from 'koa';
import { fromWeiString } from '../../../utils/big-number.ts';
import type { ApiChain } from '../../../utils/chain.ts';
import { getAmmPrice } from '../../stats/getAmmPrices.ts';
import { getTokenByAddress, getTokenNative } from '../../tokens/tokens.ts';

const MIN_QUOTE_VALUE: Partial<Record<ApiChain, number>> = {};
const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_MAX_KEYS = 10_000;

const rateLimitWindows = new Map<string, { start: number; count: number }>();

/**
 * Per ip fixed window limit, for proxies that spend a limited upstream budget.
 * cf-connecting-ip is set by Cloudflare (ctx.ip is the Heroku router as koa.proxy is off);
 * it can be spoofed by calling the origin directly, so this only stops casual abuse.
 */
export function isRateLimited(ctx: Koa.Context, bucket: string): boolean {
  const now = Date.now();
  if (rateLimitWindows.size >= RATE_LIMIT_MAX_KEYS) {
    for (const [key, window] of rateLimitWindows) {
      if (now - window.start >= RATE_LIMIT_WINDOW_MS) {
        rateLimitWindows.delete(key);
      }
    }
    // Bound memory if flooded with distinct (spoofed) ips
    if (rateLimitWindows.size >= RATE_LIMIT_MAX_KEYS) {
      rateLimitWindows.clear();
    }
  }

  const key = `${bucket}:${ctx.get('cf-connecting-ip') || ctx.ip}`;
  const window = rateLimitWindows.get(key);
  if (!window || now - window.start >= RATE_LIMIT_WINDOW_MS) {
    rateLimitWindows.set(key, { start: now, count: 1 });
    return false;
  }
  return ++window.count > RATE_LIMIT_MAX_REQUESTS;
}

export function setRateLimitedResponse(ctx: Koa.Context) {
  setNoCacheHeaders(ctx);
  ctx.status = 429;
  ctx.body = 'Too many requests, try again later';
}

export function setNoCacheHeaders(ctx: Koa.Context) {
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  ctx.set('Pragma', 'no-cache');
  ctx.set('Expires', '0');
}

export async function isQuoteValueTooLow(inputAmount: string, inputAddress: string, apiChainId: ApiChain) {
  const minQuoteValue = MIN_QUOTE_VALUE[apiChainId];
  if (!minQuoteValue) {
    return undefined;
  }

  const srcToken =
    inputAddress.toLowerCase() === NATIVE_ADDRESS.toLowerCase()
      ? getTokenNative(apiChainId)
      : getTokenByAddress(inputAddress, apiChainId);
  if (!srcToken) {
    return {
      code: 400,
      message: `Unsupported token: ${inputAddress}`,
    };
  }

  const srcPrice = await getAmmPrice(srcToken.oracleId || srcToken.id, `via isQuoteValueTooLow for ${inputAddress}`);
  if (!srcPrice) {
    return {
      code: 400,
      message: `Unsupported token: ${srcToken.symbol}`,
    };
  }

  const srcValue = fromWeiString(inputAmount, srcToken.decimals).multipliedBy(srcPrice);
  if (srcValue.isNaN() || !srcValue.isFinite() || srcValue.lt(minQuoteValue)) {
    return {
      code: 400,
      message: `Zap swap value too low, ${minQuoteValue} USD minimum required`,
    };
  }

  return undefined;
}
