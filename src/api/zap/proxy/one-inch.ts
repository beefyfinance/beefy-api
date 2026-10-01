import type { ApiChain } from '../../../utils/chain.ts';
import { errorToString } from '../../../utils/error.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { redactSecrets } from '../../../utils/secrets.ts';
import { withChainId } from '../../vaults/helpers.ts';
import { type ApiResponse, type ExtraQuoteResponse, isSuccessApiResponse } from '../api/common.ts';
import { getOneInchSwapApi } from '../api/one-inch/index.ts';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/one-inch/types.ts';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.ts';

const logger = getLoggerFor({ module: 'zap', component: 'one-inch' });

const getProxiedSwap = async (request: SwapRequest, chain: ApiChain): Promise<ApiResponse<SwapResponse>> => {
  try {
    const api = getOneInchSwapApi(chain);
    return await api.getProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

const getProxiedQuote = async (
  request: QuoteRequest,
  chain: ApiChain
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
      message: redactSecrets(errorToString(err)),
    };
  }
};

export const proxyOneInchSwap = withChainId(async (ctx, chain) => {
  const start = Date.now();
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
});

export const proxyOneInchQuote = withChainId(async (ctx, chain) => {
  const start = Date.now();
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
});
