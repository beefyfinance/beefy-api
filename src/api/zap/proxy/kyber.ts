import Koa from 'koa';
import { QuoteData, QuoteRequest, SwapData, SwapRequest } from '../api/kyber/types';
import { getKyberApi } from '../api/kyber';
import { AnyChain } from '../../../utils/chain';
import { redactSecrets } from '../../../utils/secrets';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common';
import { ApiResponse, isSuccessApiResponse } from '../api/common';

const postProxiedSwap = async (
  request: SwapRequest,
  chain: AnyChain
): Promise<ApiResponse<SwapData>> => {
  try {
    const api = getKyberApi(chain);
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
): Promise<ApiResponse<QuoteData>> => {
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
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

export async function proxyKyberSwap(ctx: Koa.Context) {
  console.log('proxyKyberSwap...');
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.request['body'] as any; // koa-bodyparser adds parsed json to body
  const proxiedSwap = await postProxiedSwap(requestObject, chain);
  console.log(`proxyKyberSwap took ${(Date.now() - start) / 1000}s`);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyKyberQuote(ctx: Koa.Context) {
  console.log('proxyKyberQuote...');
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  console.log(`proxyKyberQuote took ${(Date.now() - start) / 1000}s`);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}
