import BigNumber from 'bignumber.js';
import { Address } from 'viem';
import { ApiResponse, ExtraQuoteResponse } from '../common';

/** GET request to /quote with url params */
export type QuoteRequest = {
  /** input token address */
  src: string;
  /** output token address */
  dst: string;
  /** wei string */
  amount: string;
  /** All supported liquidity sources by default */
  protocols?: string;
  /** Partner fee in percent. min: 0; max: 3 Should be the same for /quote and /swap */
  fee?: string;
  /** Network price per gas in wei. By default fast network gas price */
  gasPrice?: string;
  /** min:0, max: 2 */
  complexityLevel?: number;
  /** min:0, max: 50 */
  parts?: number;
  /** min: 0, max: 10 */
  mainRouteParts?: number;
  /** min: 100000, max: 11500000 */
  gasLimit?: number;
  /** Return fromToken and toToken info in response */
  includeTokensInfo?: boolean;
  /** Return used swap protocols in response */
  includeProtocols?: boolean;
  /** Return approximated gas in response */
  includeGas?: boolean;
  /** min:0, max: 5 */
  connectorTokens?: string;
  /** excluded supported liquidity sources */
  excludedProtocols?: string;
};

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  domainVersion?: string;
  eip2612?: boolean;
  isFoT?: boolean;
  tags?: string[];
};

type SelectedLiquiditySource = {
  /** The liquidity source id */
  name: string;
  /** The distribution percent from total amount coming to specified destination token */
  part: number;
};

type TokenHop = {
  /** The distribution percent from source token coming to destination token on this hop */
  part: number;
  /** Destination token address */
  dst: string;
  /** Source token index in the path */
  fromTokenId: number;
  /** Destination token index in the path */
  toTokenId: number;
  /** The token split among different liquidity sources */
  protocols: SelectedLiquiditySource[];
};

type TokenSwaps = {
  /** Source token address for the hops */
  token: string;
  /** Swap hops from source token */
  hops: TokenHop[];
};

type ErrorMeta = {
  type: string;
  value: string;
};

export type OneInchErrorResponse = {
  error: string;
  description: string;
  statusCode: number;
  requestId: string;
  meta: ErrorMeta[];
};

export type QuoteResponse = {
  /** Source token info (if includeTokensInfo = true on request) */
  srcToken?: TokenInfo;
  /** Destination token info (if includeTokensInfo = true on request)  */
  dstToken?: TokenInfo;
  /** Expected amount of destination token */
  dstAmount: string;
  /** Selected protocols in a path (if includeProtocols = true on request)  */
  protocols?: TokenSwaps[];
  /** Estimated gas (if includeGas = true on request) */
  gas?: number;
};

/** GET request to /swap with url params */
export type SwapRequest = Pick<
  QuoteRequest,
  | 'src'
  | 'dst'
  | 'amount'
  | 'protocols'
  | 'fee'
  | 'gasPrice'
  | 'complexityLevel'
  | 'parts'
  | 'mainRouteParts'
  | 'gasLimit'
  | 'includeTokensInfo'
  | 'includeProtocols'
  | 'includeGas'
  | 'connectorTokens'
  | 'excludedProtocols'
> & {
  /** The address that calls the 1inch contract */
  from: string;
  /** An EOA address that initiate the transaction */
  origin: string;
  /** https://eips.ethereum.org/EIPS/eip-2612 */
  permit?: string;
  /** This address will receive funds after the swap. By default same address as "from" param */
  receiver?: string;
  /** undocumented */
  referrer?: string;
  /** By default set to false */
  allowPartialFill?: boolean;
  /** Allows to swap tokens with internal transfer fee */
  compatibility?: boolean;
  /** Enable this flag to disable onchain simulation */
  disableEstimate?: boolean;
  /** Enable this flag if you patch input amount on your smart contract */
  usePatching?: boolean;
  /** Enable this flag in case you did an approval to permit2 smart contract */
  usePermit2?: boolean;
  /** When enabled, the approval check during simulation will be skipped */
  forceApprove?: boolean;
} & (
    | {
        /**
         * Slippage tolerance in percent. Min: 0; Max: 50.
         * Use either slippage or minReturn, not both.
         * Advantages of slippage:
         * - minReturn is calculated relative to the actual rate
         * - For tokens with fee-on-transfer, re-estimation occurs and slippage is applied to the actual amount
         * - Allows path re-routing if initial estimation fails Disadvantages of slippage:
         * - The /swap result needs verification - check how much slippage the user agrees to accept
         * @example: slippage=1 means accepting up to 1% less than the expected amount.
         **/
        slippage: number;
      }
    | {
        /**
         * Minimum amount of destination token that must be received, in the smallest unit (considering decimals).
         * Use either minReturn or slippage, not both.
         * Advantages of minReturn:
         * - Result guaranteed to not be lower than this amount Disadvantages of minReturn:
         * - If rate changes between /quote and /swap requests, you'll get an error
         * - Must be calculated manually relative to quote.dstAmount minus desired slippage percentage
         * - Must be manually selected for fee-on-transfer tokens
         * - Path won't be re-estimated if estimation fails
         * - Requires precise calculation and understanding of the value being set
         * @example: For a token with 18 decimals, minReturn=1000000000000000000 requires at least 1 token.
         */
        minReturn: string;
      }
  );

export type SwapTx = {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
};

export type SwapResponse = Pick<QuoteResponse, 'srcToken' | 'dstToken' | 'dstAmount' | 'protocols'> & {
  tx: SwapTx;
};

export type OneInchResponse = OneInchErrorResponse | QuoteResponse | SwapResponse;

export function isOneInchErrorResponse(obj: unknown): obj is OneInchErrorResponse {
  return obj && typeof obj === 'object' && 'error' in obj;
}

export function isOneInchSuccessResponse(obj: unknown): obj is QuoteResponse | SwapResponse {
  return obj && typeof obj === 'object' && 'dstAmount' in obj;
}

export interface IOneInchSwapApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  getSwap(request: SwapRequest): Promise<SwapResponse>;
  getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse, ExtraQuoteResponse>>;
  getProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>>;
}

export type RateRequest = Address[];

export type RateResponse = Record<Address, BigNumber>;

export interface IOneInchPriceApi {
  getRatesToNative(tokenAddresses: RateRequest): Promise<RateResponse>;
}
