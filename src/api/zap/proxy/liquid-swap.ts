import type Koa from 'koa';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/liquid-swap/types.ts';
import { getLiquidSwapApi } from '../api/liquid-swap/index.ts';
import type { AnyChain } from '../../../utils/chain.ts';
import { redactSecrets } from '../../../utils/secrets.ts';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.ts';
import { type ApiResponse, type ExtraQuoteResponse, isSuccessApiResponse } from '../api/common.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'zap', platform: 'liquidSwap' });

const postProxiedSwap = async (request: SwapRequest, chain: AnyChain): Promise<ApiResponse<SwapResponse>> => {
  try {
    const api = getLiquidSwapApi(chain);
    return await api.postProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

const getProxiedQuote = async (
  request: QuoteRequest,
  chain: AnyChain
): Promise<ApiResponse<QuoteResponse, ExtraQuoteResponse>> => {
  try {
    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getLiquidSwapApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

export async function proxyLiquidSwapSwap(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.request['body'] as any; // koa-bodyparser adds parsed json to body
  const proxiedSwap = await postProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyLiquidSwapQuote(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  if (isSuccessApiResponse(proxiedQuote)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied quote');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote)
    ? { ...proxiedQuote.data, extra: proxiedQuote.extra }
    : proxiedQuote.message;
}
