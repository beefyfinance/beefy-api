import type { ApiResponse, ExtraQuoteResponse } from '../common.ts';

// Enso rejects the checksummed form
export const ENSO_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

/** GET request to /shortcuts/quote with url params (chainId and routingStrategy are added by the api) */
export type EnsoQuoteRequest = {
  /** input token address, or ENSO_NATIVE_ADDRESS */
  tokenIn: string;
  /** output token address, or ENSO_NATIVE_ADDRESS */
  tokenOut: string;
  /** wei string */
  amountIn: string;
};

/** GET request to /shortcuts/route with url params (receiver, spender and refundReceiver are set to fromAddress) */
export type EnsoSwapRequest = EnsoQuoteRequest & {
  /** The address that calls the Enso router (the zap router) */
  fromAddress: string;
  /** wei string, embedded in the calldata */
  minAmountOut: string;
};

export type EnsoRouteStep = {
  action: string;
  protocol: string;
  tokenIn: string[];
  tokenOut: string[];
};

export type EnsoQuoteResponse = {
  /** wei string */
  amountOut: string;
  /** basis points */
  priceImpact: number | null;
  feeAmount?: string[];
  route: EnsoRouteStep[];
};

export type EnsoTx = {
  to: string;
  from?: string;
  data: string;
  value: string;
};

export type EnsoPreTransaction = {
  type: string;
  token: string;
  spender: string;
  amount: string;
};

export type EnsoRouteResponse = {
  /** wei string */
  amountOut: string;
  /** wei string */
  minAmountOut: string;
  gas: string;
  /** basis points */
  priceImpact: number | null;
  tx: EnsoTx;
  route: EnsoRouteStep[];
  preTransactions?: EnsoPreTransaction[];
  createdAt: number;
};

/** Validated and trimmed /shortcuts/route response returned by the proxy */
export type EnsoSwapResponse = Pick<EnsoRouteResponse, 'amountOut' | 'minAmountOut' | 'gas' | 'priceImpact' | 'tx'>;

/** 400: {message: string[], error, statusCode, requestId}; 401/429: {error, message?, portalUrl} */
export type EnsoErrorResponse = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  requestId?: string;
  portalUrl?: string;
};

export function isEnsoSuccessResponse(obj: unknown): obj is EnsoQuoteResponse | EnsoRouteResponse {
  return !!obj && typeof obj === 'object' && 'amountOut' in obj && typeof obj.amountOut === 'string';
}

export function isEnsoErrorResponse(obj: unknown): obj is EnsoErrorResponse {
  return (
    !!obj
    && typeof obj === 'object'
    && !('amountOut' in obj)
    && (('error' in obj && typeof obj.error === 'string')
      || ('message' in obj && (typeof obj.message === 'string' || Array.isArray(obj.message))))
  );
}

export interface IEnsoApi {
  getQuote(request: EnsoQuoteRequest): Promise<EnsoQuoteResponse>;
  getProxiedQuote(request: EnsoQuoteRequest): Promise<ApiResponse<EnsoQuoteResponse, ExtraQuoteResponse>>;
  getProxiedSwap(request: EnsoSwapRequest): Promise<ApiResponse<EnsoSwapResponse>>;
}
