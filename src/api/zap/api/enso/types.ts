import type { ApiResponse, ExtraQuoteResponse } from '../common.ts';

// Enso rejects the checksummed form
export const ENSO_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

/** ignoreAggregators values accepted by /shortcuts/quote and /shortcuts/route */
export const ENSO_AGGREGATORS = new Set([
  '0x',
  '1inch',
  'openocean',
  'kyberswap',
  'native',
  'paraswap',
  'bebop',
  'barter',
  'sushiswap-router',
  'ooga-booga',
  'renegade',
  'uniswap',
  'rooster',
  'wowmax',
  'grapher',
  'hyperbloom',
  'hyperswap',
  'hyperflow',
  'fly',
  'eisen',
  'nordstern',
  'everlong',
  'bitget',
  'akka',
]);

/** How long Enso searches for a route; Enso's default is high */
export type EnsoEffort = 'light' | 'medium' | 'high';

/** GET request to /shortcuts/quote with url params (chainId, routingStrategy and effort are added by the api) */
export type EnsoQuoteRequest = {
  /** input token address, or ENSO_NATIVE_ADDRESS */
  tokenIn: string;
  /** output token address, or ENSO_NATIVE_ADDRESS */
  tokenOut: string;
  /** wei string */
  amountIn: string;
  /** comma separated Enso aggregator slugs (ENSO_AGGREGATORS) to exclude from routing */
  ignoreAggregators?: string;
};

/** GET request to /shortcuts/route with url params (receiver and refundReceiver are set to fromAddress) */
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

export type EnsoFeeBreakdown = {
  role: string;
  token: string;
  receiver: string;
  bps: string;
  amount: string;
};

/** Enso fees are taken from tokenIn before the swap, so amountOut is already net of them */
export type EnsoFees = {
  feeAmount?: string[];
  ensoFeeAmount?: string[];
  feeBreakdown?: EnsoFeeBreakdown[];
};

export type EnsoQuoteResponse = EnsoFees & {
  /** wei string */
  amountOut: string;
  /** basis points */
  priceImpact: number | null;
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

export type EnsoRouteResponse = EnsoFees & {
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
