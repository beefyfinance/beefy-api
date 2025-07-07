import { ApiResponse } from '../common';

export type QuoteRequest = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  multiHop?: boolean;
  /** 0-100, default 1 (1%) */
  slippage?: number;
  unwrapWHYPE?: boolean;
  excludeDexes?: string;
  /** 100 = 1%, default 0 */
  feeBps?: number;
  feeRecepient?: string;
};

export type QuoteToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
};

export type QuoteExecutionHop = {
  tokenIn: string;
  tokenOut: string;
  routerIndex: number;
  routerName: string;
  fee: number;
  amountIn: string;
  amountOut: string;
  stable: boolean;
  priceImpact: string;
};

export type QuoteExecutionDetails = {
  path: string[];
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  feeBps?: number;
  feeRecipient?: string;
  feePercentage?: string;
  hopSwaps: Array<Array<QuoteExecutionHop>>;
};

export type QuoteExecution = {
  to: string;
  calldata: string;
  details: QuoteExecutionDetails;
};

export type QuoteResponse = {
  success: true;
  tokens: {
    tokenIn: QuoteToken;
    tokenOut: QuoteToken;
    intermediate?: QuoteToken;
  };
  amountIn: string;
  amountOut: string;
  averagePriceImpact: string;
  execution: QuoteExecution;
};

export type SwapRequest = QuoteRequest;

export type SwapResponse = QuoteResponse;

export type LiquidSwapErrorResponse = {
  success: false;
  message: string;
};

export type LiquidSwapSuccessResponse = QuoteResponse | SwapResponse;

export type LiquidSwapResponse = LiquidSwapSuccessResponse | LiquidSwapErrorResponse;

export function isLiquidSwapResponse(obj: unknown): obj is LiquidSwapResponse {
  return obj && typeof obj === 'object' && 'success' in obj;
}

export function isLiquidSwapErrorResponse(obj: LiquidSwapResponse): obj is LiquidSwapErrorResponse {
  return isLiquidSwapResponse(obj) && obj.success === false;
}

export function isLiquidSwapSuccessResponse(obj: LiquidSwapResponse): obj is LiquidSwapSuccessResponse {
  return isLiquidSwapResponse(obj) && obj.success === true;
}

export interface ILiquidSwapApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  postSwap(request: SwapRequest): Promise<SwapResponse>;
  getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>>;
  postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>>;
}
