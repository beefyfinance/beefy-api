import Koa from 'koa';
import { AnyChain } from '../../../utils/chain';
import { redactSecrets } from '../../../utils/secrets';
import { ApiResponse, ExtraQuoteResponse, isSuccessApiResponse } from '../api/common';
import { getOdosApi } from '../api/odos';
import { QuoteRequestV3, QuoteResponseV3, SwapRequestV3, SwapResponseV3 } from '../api/odos/types';
import { setNoCacheHeaders } from './common';

const postProxiedQuote = async (
  request: QuoteRequestV3,
  chain: AnyChain
): Promise<ApiResponse<QuoteResponseV3, ExtraQuoteResponse>> => {
  try {
    const api = getOdosApi(chain);
    return await api.postProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

export async function proxyOdosQuote(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequestV3 = ctx.request['body'] as any;
  const proxiedQuote = await postProxiedQuote(requestObject, chain);
  if (isSuccessApiResponse(proxiedQuote)) {
    console.log(`proxyOdosQuote took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote)
    ? { ...proxiedQuote.data, extra: proxiedQuote.extra }
    : proxiedQuote.message;
}

const postProxiedSwap = async (
  request: SwapRequestV3,
  chain: AnyChain
): Promise<ApiResponse<SwapResponseV3>> => {
  try {
    const api = getOdosApi(chain);
    return await api.postProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(err.message || 'Unknown error'),
    };
  }
};

export async function proxyOdosSwap(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequestV3 = ctx.request['body'] as any;
  const proxiedSwap = await postProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    console.log(`proxyOdosSwap took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}
