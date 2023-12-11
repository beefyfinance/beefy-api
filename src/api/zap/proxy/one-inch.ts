import Koa from 'koa';
import { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/one-inch/types';
import { getOneInchSwapApi } from '../api/one-inch';
import { AnyChain } from '../../../utils/chain';
import { redactSecrets } from '../../../utils/secrets';
import { setNoCacheHeaders } from './common';
import { ApiResponse, isSuccessApiResponse } from '../api/common';

const getProxiedSwap = async (
  request: SwapRequest,
  chain: AnyChain
): Promise<ApiResponse<SwapResponse>> => {
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
): Promise<ApiResponse<QuoteResponse>> => {
  try {
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
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyOneInchQuote(ctx: Koa.Context) {
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}
