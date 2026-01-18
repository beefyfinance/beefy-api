import { ApiResponse, ExtraQuoteResponse } from '../common';
import { Address, Hex } from 'viem';

export type TokenAddressAmount = {
  /** Address of the token to swap from. This should be a checksummed address. */
  tokenAddress: Address;
  /** Amount of the token in fixed precision (wei). */
  amount: string;
};

export type TokenAddressProportion = {
  /** Address of the token to swap to. This should be a checksummed address. */
  tokenAddress: Address;
  /** Percent of token to output. For a single swap, this is set to 1. (float) */
  proportion: number;
};

export type PathVizImageConfig = {
  /** List of hex codes to generate color spectrum for liquidity sources in path visualization */
  linkColors?: string[];
  /** 	Hex code for setting the color of token nodes in path visualization */
  nodeColor?: string;
  /** Hex code to set the color of token symbol text on token nodes */
  nodeTextColor?: string;
  /** Hex code to set the color of the visualization legend text */
  legendTextColor?: string;
  /** Set a custom width proportion for the visualization */
  width?: number;
  /** Set a custom height proportion for the visualization */
  height?: number;
};

export type QuoteRequestV3 = {
  /** Numeric EVM chain id */
  chainId: number;
  /** Use Odos V2 compact call data for transaction, defaults to true */
  compact?: boolean;
  /** Disable all exchanges that qualify as RFQs with centralized API dependencies and time-sensitive quotes or potential user address restrictions. Default is true. */
  disableRFQs?: boolean;
  /** The address that will receive the delegated fee. This must be a valid checksummed Ethereum address. */
  feeRecipient?: Address;
  /** Gas price to use for path generation. This price directly affects the path computation. If no gas price is provided, our default price from our frontend will be used. */
  gasPrice?: number;
  /** Input tokens and amounts for quote */
  inputTokens: TokenAddressAmount[];
  /** If input and output tokens are all the same asset type (ex: USD stable coins), only route through like assets for decreased slippage. Defaults to false */
  likeAsset?: boolean;
  /** Output tokens and proportions for quote */
  outputTokens: TokenAddressProportion[];
  /** The fee percentage to be applied to the swap. This is specified as a decimal value (e.g., 0.001 for 0.1% or 10 basis points). */
  partnerFeePercent?: number;
  /** Return a Base64 encoded SVG of path visualization image for display on web frontends */
  pathViz?: boolean;
  /** Optional customization parameters for generated path viz image */
  pathVizImageConfig?: PathVizImageConfig;
  /** provide token approval via permit2 */
  permit2?: boolean;
  /** List of pool ids that are not to be used for the swap path */
  poolBlacklist?: string[];
  /**
   * Code for registering your usage with Odos and receiving partner specific benefits.
   * @deprecated
   **/
  referralCode?: number;
  /** @deprecated */
  referralFee?: number;
  /** @deprecated */
  referralFeeRecipient?: Address;
  /** If a less complicated quote and/or a quicker response time is desired, this flag can be set. Defaults to false */
  simple?: boolean;
  /** Slippage percent to use for checking if the path is valid. Float. Example: to set slippage to 0.5% send 0.5. If 1% is desired, send 1. If not provided, slippage will be set 0.3. */
  slippageLimitPercent?: number;
  /**	List of liquidity providers that are not to be used for the swap path. A list of all liquidity providers for a given chain can be retrieved from `info/liquidity-sources/{chain_id}` */
  sourceBlacklist?: string[];
  /** List of liquidity providers to exclusively use for the swap path. A list of all liquidity providers for a given chain can be retrieved from `info/liquidity-sources/{chain_id}` */
  sourceWhitelist?: string[];
  /** Address of the wallet executing the swap. If no wallet is provided, the quote cannot be turned into a path. This can be viewed as informational only. */
  userAddr?: Address;
};

export type QuoteResponseV3 = {
  /** Block number the quote was generated for */
  blockNumber: number;
  /** Used for Layer 2 chains */
  dataGasEstimate: number;
  /** If the endpoint or any part of the request is deprecated, this field will be populated with a message. This field is omitted if there is nothing to notify on. */
  deprecated?: string;
  /** A very naive gas estimate */
  gasEstimate: number;
  /** USD Value of the gasEstimate */
  gasEstimateValue: number;
  /** 	Amount of gWei per gas unit */
  gweiPerGas: number;
  /** A list of input token amounts in fixed precision (wei) */
  inAmounts: string[];
  /** A list of input token addresses */
  inTokens: Address[];
  /** A list of the input values of the given input tokens. In the same order as the inputTokens list */
  inValues: number[];
  /** USD value of the sum of the output tokens after gas */
  netOutValue: number;
  /** A list of output token amounts in fixed precision (wei) */
  outAmounts: string[];
  /** A list of output token addresses */
  outTokens: Address[];
  /** A list of the output values of the given output tokens. In the same order as the outputTokens list */
  outValues: number[];
  /** Percent fee taken by partner referral code given. Fee is already deducted from quote */
  partnerFeePercent: number;
  /** ID of the path used for asking for an assembled quote */
  pathId?: string;
  /** (no description provided) */
  pathViz?: Record<string, unknown>;
  /** Base64 encoded image ready to be used within a UI */
  pathVizImage?: string;
  /** Percent difference between the value of all input tokens and the value of all output tokens (as determined by the Odos pricing service) */
  percentDiff: number;
  /** (no description provided) */
  permit2Hash?: string;
  /** (no description provided) */
  permit2Message?: Record<string, unknown>;
  /** Percent decrease in the realized price of the path from the initial price of the path before the swap is executed. */
  priceImpact?: number;
  /** (no description provided) */
  traceId?: string;
  /** additional information added by beefy api */
  beefy: ExtraQuoteResponse;
};

export type SwapRequestV3 = {
  /** Address of the user who requested the quote */
  userAddr: Address;
  /** ID of the Path returned from the sor/quote/{version} endpoint */
  pathId: string;
  /** Simulate the transaction to make sure it can actually be executed. This increases the response time to receive transaction data. Defaults to False. */
  simulate?: boolean;
  /** Optionally, specify a different receiver address for the transaction output, default receiver is userAddr */
  receiver?: Address;
  /** (no description provided) */
  permit2Signature?: string;
};

export type SwapTransactionV3 = {
  /** txn gas amount */
  gas: number;
  /** txn gas price in gwei */
  gasPrice: number;
  /** value of the transaction */
  value: string;
  /** txn to address */
  to: Address;
  /** txn from address */
  from: Address;
  /** txn bytecode to execute */
  data: Hex;
  /** current user nonce */
  nonce: number;
  /** id of the chain transaction was assembled for */
  chainId: number;
};

export type SwapSimulationV3 = {
  /** true if no errors were detected during simulation */
  isSuccess: boolean;
  /** list of amounts out from simulation */
  amountsOut: number[];
  /** on-chain estimateGas raw response value */
  gasEstimate: number;
  /** simulation error data (if error) */
  simulationError?: {
    /** error type */
    type: string;
    /** content of the simulation error message */
    errorMessage: string;
  };
};

export type SwapResponseV3 = {
  /** If the endpoint or any part of the request is deprecated, this field will be populated with a message. This field is omitted if there is nothing to notify on. */
  deprecated?: string;
  /** (no description provided) */
  traceId?: string;
  /** Block number the quote was generated for */
  blockNumber: number;
  /** A very naive gas estimate */
  gasEstimate: number;
  /** USD Value of the gasEstimate */
  gasEstimateValue: number;
  /** List of input token addresses and amounts */
  inputTokens: TokenAddressAmount[];
  /** List of output token addresses and amounts */
  outputTokens: TokenAddressAmount[];
  /**	USD value of the sum of the output tokens after gas */
  netOutValue: number;
  /** A list of the output values of the given output tokens. In the same order as the outputTokens list */
  outValues: string[];
  /** Transaction data needed for execution */
  transaction: SwapTransactionV3;
  /** Simulation results */
  simulation?: SwapSimulationV3;
};

export type OdosErrorResponse = {
  detail: string;
  traceId?: string;
  errorCode?: number;
};

export function isOdosErrorResponse(obj: unknown): obj is OdosErrorResponse {
  return obj && typeof obj === 'object' && 'detail' in obj;
}

export interface IOdosApiV3 {
  postQuote(request: QuoteRequestV3): Promise<QuoteResponseV3>;
  postSwap(request: SwapRequestV3): Promise<SwapResponseV3>;
  postProxiedQuote(request: QuoteRequestV3): Promise<ApiResponse<QuoteResponseV3, ExtraQuoteResponse>>;
  postProxiedSwap(request: SwapRequestV3): Promise<ApiResponse<SwapResponseV3>>;
}
