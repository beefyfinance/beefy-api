import type Koa from 'koa';
import type { AnyChain } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { redactSecrets } from '../../../utils/secrets.ts';
import { type ApiResponse, type ExtraQuoteResponse, isSuccessApiResponse } from '../api/common.ts';
import { getOneInchSwapApi } from '../api/one-inch/index.ts';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/one-inch/types.ts';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.ts';

const logger = getLoggerFor({ module: 'zap', platform: 'oneInch' });

const getProxiedSwap = async (request: SwapRequest, chain: AnyChain): Promise<ApiResponse<SwapResponse>> => {
  try {
    const api = getOneInchSwapApi(chain);
    return await api.getProxiedSwap(request);
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
    const tooLowError = await isQuoteValueTooLow(request.amount, request.src, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getOneInchSwapApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

export async function proxyOneInchSwap(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyOneInchQuote(ctx: Koa.Context) {
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
