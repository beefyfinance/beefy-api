import type { ApiChain } from '../../../utils/chain.ts';
import { errorToString } from '../../../utils/error.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { redactSecrets } from '../../../utils/secrets.ts';
import { withChainId } from '../../vaults/helpers.ts';
import { type ApiResponse, type ExtraQuoteResponse, isSuccessApiResponse } from '../api/common.ts';
import { getKyberApi } from '../api/kyber/index.ts';
import type { QuoteData, QuoteRequest, SwapData, SwapRequest } from '../api/kyber/types.ts';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.ts';

const logger = getLoggerFor({ module: 'zap', component: 'kyber' });

const postProxiedSwap = async (request: SwapRequest, chain: ApiChain): Promise<ApiResponse<SwapData>> => {
  try {
    const api = getKyberApi(chain);
    return await api.postProxiedSwap(request);
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
): Promise<ApiResponse<QuoteData, ExtraQuoteResponse>> => {
  try {
    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getKyberApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export const proxyKyberSwap = withChainId(async (ctx, chain) => {
  const start = Date.now();
  const requestObject: SwapRequest = ctx.request['body'] as any; // koa-bodyparser adds parsed json to body
  const proxiedSwap = await postProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
});

export const proxyKyberQuote = withChainId(async (ctx, chain) => {
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
