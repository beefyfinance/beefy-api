import type { ApiResponse, ExtraQuoteResponse } from '../common.ts';

export const OKX_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

/** GET request to /aggregator/quote (chainIndex and swapMode are added by the api) */
export type OkxQuoteRequest = {
  /** input token address, or OKX_NATIVE_ADDRESS */
  tokenIn: string;
  /** output token address, or OKX_NATIVE_ADDRESS */
  tokenOut: string;
  /** wei string */
  amountIn: string;
  /** "true" sends disableRFQ, RFQ quotes expire too fast for delayed (cross-chain) execution */
  excludeRfq?: string;
};

/** GET request to /aggregator/swap (userWalletAddress and swapReceiverAddress are set to fromAddress) */
export type OkxSwapRequest = OkxQuoteRequest & {
  /** The address that calls the OKX router (the zap router) */
  fromAddress: string;
  /** fraction string, e.g. "0.01" is 1%; sent to OKX as slippagePercent */
  slippage: string;
  /** wei string, from the quote the user accepted; swaps with a lower min out are rejected */
  minAmountOut: string;
};

export type OkxToken = {
  tokenContractAddress: string;
  tokenSymbol: string;
  decimal: string;
  tokenUnitPrice: string | null;
  isHoneyPot: boolean;
  taxRate: string;
};

export type OkxQuoteResponse = {
  chainIndex: string;
  /** wei string */
  fromTokenAmount: string;
  /** wei string */
  toTokenAmount: string;
  /** percent string, may be empty */
  priceImpactPercent: string;
  /** estimated gas in USD */
  tradeFee: string;
  estimateGasFee: string;
  dexRouterList: unknown[];
  fromToken: OkxToken;
  toToken: OkxToken;
};

export type OkxTx = {
  from?: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  minReceiveAmount: string;
  maxSpendAmount?: string;
  slippagePercent: string;
  signatureData?: string[];
};

export type OkxRouteResponse = {
  routerResult: OkxQuoteResponse;
  tx: OkxTx;
};

/** Validated and trimmed /aggregator/swap response returned by the proxy */
export type OkxSwapResponse = {
  /** wei string */
  toAmount: string;
  /** wei string */
  minToAmount: string;
  priceImpactPercent: string;
  gas: string;
  tx: Pick<OkxTx, 'to' | 'from' | 'data' | 'value'>;
  /** Spender to approve for ERC20 input (not tx.to); undefined for native input */
  approveAddress: string | undefined;
};

/** All responses (including most errors) use this envelope; success iff code === "0" */
export type OkxEnvelope<T> = {
  code: string;
  msg: string;
  data: T[];
};

export function isOkxEnvelope(obj: unknown): obj is OkxEnvelope<unknown> {
  return (
    !!obj
    && typeof obj === 'object'
    && 'code' in obj
    && typeof obj.code === 'string'
    && (!('data' in obj) || obj.data === undefined || Array.isArray(obj.data))
  );
}

export interface IOkxApi {
  getQuote(request: OkxQuoteRequest): Promise<OkxQuoteResponse>;
  getProxiedQuote(request: OkxQuoteRequest): Promise<ApiResponse<OkxQuoteResponse, ExtraQuoteResponse>>;
  getProxiedSwap(request: OkxSwapRequest): Promise<ApiResponse<OkxSwapResponse>>;
}
