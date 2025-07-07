import Koa from 'koa';
import { QuoteResponse, QuoteRequest, SwapResponse, SwapRequest } from '../api/liquid-swap/types';
import { getLiquidSwapApi } from '../api/liquid-swap/index.js';
import { AnyChain } from '../../../utils/chain';
import { redactSecrets } from '../../../utils/secrets';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common';
import { ApiResponse, isSuccessApiResponse } from '../api/common';

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
): Promise<ApiResponse<QuoteResponse>> => {
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
    console.log(`proxyLiquidSwapSwap took ${(Date.now() - start) / 1000}s on ${chain}`);
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
    console.log(`proxyLiquidSwapQuote took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}
