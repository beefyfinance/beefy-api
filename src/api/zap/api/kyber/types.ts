import { ApiResponse } from '../common';

export type QuoteRequest = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  saveGas?: boolean;
  includedSources?: string[];
  excludedSources?: string[];
  gasInclude?: boolean;
  gasPrice?: string;
} & Partial<ExtraFee>;

export type ExtraFee = {
  feeAmount: string;
  chargeFeeBy: string;
  isInBps: boolean;
  feeReceiver: string;
};

export type SwapRoute = {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  limitReturnAmount: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolLength: string;
  poolType: string;
  extra: string;
};

export type RouteSummary = {
  tokenIn: string;
  amountIn: string;
  amountInUsd: string;
  tokenOut: string;
  amountOut: string;
  amountOutUsd: string;
  gas: string;
  gasPrice: string;
  gasUsd: string;
  extraFee: ExtraFee;
  route: SwapRoute[];
};

export type QuoteData = {
  routeSummary: RouteSummary;
  routeAddress: string;
};

export type QuoteResponse = {
  code: 0;
  message: string;
  data: QuoteData;
};

export type SwapRequest = {
  routeSummary: RouteSummary;
  deadline?: number; // unix timestamp, default +20minutes
  slippageTolerance?: number; // 10 means 0.1%, default is 0
  sender: string;
  recipient: string;
};

export type SwapData = {
  amountIn: string;
  amountInUsd: string;
  amountOut: string;
  amountOutUsd: string;
  gas: string;
  gasUsd: string;
  outputChange: unknown; // deprecated
  data: string;
  routerAddress: string;
};

export type SwapResponse = {
  code: 0;
  message: string;
  data: SwapData;
};

export type KyberErrorResponse = {
  code: number;
  message: string;
};

export type KyberSuccessResponse = QuoteResponse | SwapResponse;

export type KyberResponse = KyberSuccessResponse | KyberErrorResponse;

export function isKyberResponse(obj: unknown): obj is KyberResponse {
  return obj && typeof obj === 'object' && 'code' in obj;
}

export function isKyberErrorResponse(obj: KyberResponse): obj is KyberErrorResponse {
  return isKyberResponse(obj) && obj.code !== 0;
}

export function isKyberSuccessResponse(obj: KyberResponse): obj is KyberSuccessResponse {
  return isKyberResponse(obj) && obj.code === 0;
}

export interface IKyberApi {
  getQuote(request: QuoteRequest): Promise<QuoteData>;
  postSwap(request: SwapRequest): Promise<SwapData>;
  getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteData>>;
  postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapData>>;
}
