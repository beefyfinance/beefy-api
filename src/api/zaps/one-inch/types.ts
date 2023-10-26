import BigNumber from 'bignumber.js';

export type HealthCheckResponse = {
  status: string;
  provider: string;
};

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

export type QuoteResponse = {
  fromToken: QuoteToken;
  toToken: QuoteToken;
  toAmount: string;
};

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

export type ProxiedResponse = {
  status: number;
  statusText: string;
  response?: SwapResponse | QuoteResponse;
};

export interface IOneInchSwapApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  getSwap(request: SwapRequest): Promise<SwapResponse>;
  getProxiedQuote(request: QuoteRequest): Promise<ProxiedResponse>;
  getProxiedSwap(request: SwapRequest): Promise<ProxiedResponse>;
  isHealthy(): Promise<boolean>;
}

export type RateRequest = string[];

export type RateResponse = Record<string, BigNumber>;

export interface IOneInchPriceApi {
  getRatesToNative(tokenAddresses: RateRequest): Promise<RateResponse>;
}
