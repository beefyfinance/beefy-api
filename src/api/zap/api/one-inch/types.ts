import BigNumber from 'bignumber.js';
import { Address } from 'viem';
import { ApiResponse } from '../common';

export type QuoteRequest = {
  src: string;
  dst: string;
  amount: string;
  fee?: string;
};

export type QuoteToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
};

export type OneInchErrorResponse = {
  statusCode: number;
  error: string;
  description: string;
  meta: Record<string, string | number>[];
  requestId: string;
};

export type QuoteResponse = {
  fromToken: QuoteToken;
  toToken: QuoteToken;
  toAmount: string;
};

export function isOneInchErrorResponse(obj: unknown): obj is OneInchErrorResponse {
  return obj && typeof obj === 'object' && 'error' in obj;
}

export type SwapRequest = {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  fee?: string;
  referrer?: string;
  disableEstimate?: boolean;
};

export type SwapTx = {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
};

export type SwapResponse = {
  fromToken: QuoteToken;
  toToken: QuoteToken;
  toAmount: string;
  tx: SwapTx;
};

export interface IOneInchSwapApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  getSwap(request: SwapRequest): Promise<SwapResponse>;
  getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>>;
  getProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>>;
}

export type RateRequest = Address[];

export type RateResponse = Record<Address, BigNumber>;

export interface IOneInchPriceApi {
  getRatesToNative(tokenAddresses: RateRequest): Promise<RateResponse>;
}
