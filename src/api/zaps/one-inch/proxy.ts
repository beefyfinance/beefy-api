import { getOneInchSwapApi } from '.';
import { AnyChain } from '../../../utils/chain';
import { ProxiedResponse, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './types';

export const getProxiedSwap = async (
  request: SwapRequest,
  chain: AnyChain
): Promise<ProxiedResponse> => {
  try {
    const api = getOneInchSwapApi(chain);
    return await api.getProxiedSwap(request);
  } catch (err) {
    return {
      status: 500,
      statusText: err.message,
    };
  }
};

export const getProxiedQuote = async (
  request: QuoteRequest,
  chain: AnyChain
): Promise<ProxiedResponse> => {
  try {
    const api = getOneInchSwapApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      status: 500,
      statusText: err.message,
    };
  }
};
