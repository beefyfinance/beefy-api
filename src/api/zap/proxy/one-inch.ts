import Koa from 'koa';
import { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/one-inch/types';
import { getOneInchSwapApi } from '../api/one-inch';
import { AnyChain, toApiChain } from '../../../utils/chain';
import { redactSecrets } from '../../../utils/secrets';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common';
import { ApiResponse, isSuccessApiResponse } from '../api/common';
import { getTokenByAddress } from '../../tokens/tokens';
import { getAmmPrice } from '../../stats/getAmmPrices';
import { fromWeiString } from '../../../utils/big-number';

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
  console.log('proxyOneInchSwap... ' + chain);
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  console.log(`proxyOneInchSwap took ${(Date.now() - start) / 1000}s`);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyOneInchQuote(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  console.log('proxyOneInchQuote... ' + chain);
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  console.log(`proxyOneInchQuote took ${(Date.now() - start) / 1000}s`);
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}
