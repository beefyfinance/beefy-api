import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import {
  PromiEvent,
  TransactionReceipt,
  EventResponse,
  EventData,
  Web3ContractContext,
} from 'ethereum-abi-types-generator';

export interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface SendOptions {
  from: string;
  value?: number | string | BN | BigNumber;
  gasPrice?: string;
  gas?: number;
}

export interface EstimateGasOptions {
  from?: string;
  value?: number | string | BN | BigNumber;
  gas?: number;
}

export interface MethodPayableReturnContext {
  send(options: SendOptions): PromiEvent<TransactionReceipt>;
  send(
    options: SendOptions,
    callback: (error: Error, result: any) => void
  ): PromiEvent<TransactionReceipt>;
  estimateGas(options: EstimateGasOptions): Promise<number>;
  estimateGas(
    options: EstimateGasOptions,
    callback: (error: Error, result: any) => void
  ): Promise<number>;
  encodeABI(): string;
}

export interface MethodConstantReturnContext<TCallReturn> {
  call(): Promise<TCallReturn>;
  call(options: CallOptions): Promise<TCallReturn>;
  call(
    options: CallOptions,
    callback: (error: Error, result: TCallReturn) => void
  ): Promise<TCallReturn>;
  encodeABI(): string;
}

export interface MethodReturnContext extends MethodPayableReturnContext {}

export type ContractContext = Web3ContractContext<
  SwapFlashLoan,
  SwapFlashLoanMethodNames,
  SwapFlashLoanEventsContext,
  SwapFlashLoanEvents
>;
export type SwapFlashLoanEvents =
  | 'AddLiquidity'
  | 'FlashLoan'
  | 'NewAdminFee'
  | 'NewSwapFee'
  | 'OwnershipTransferred'
  | 'Paused'
  | 'RampA'
  | 'RemoveLiquidity'
  | 'RemoveLiquidityImbalance'
  | 'RemoveLiquidityOne'
  | 'StopRampA'
  | 'TokenSwap'
  | 'Unpaused';
export interface SwapFlashLoanEventsContext {
  AddLiquidity(
    parameters: {
      filter?: { provider?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  FlashLoan(
    parameters: {
      filter?: { receiver?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  NewAdminFee(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  NewSwapFee(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  OwnershipTransferred(
    parameters: {
      filter?: {
        previousOwner?: string | string[];
        newOwner?: string | string[];
      };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Paused(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RampA(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RemoveLiquidity(
    parameters: {
      filter?: { provider?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RemoveLiquidityImbalance(
    parameters: {
      filter?: { provider?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RemoveLiquidityOne(
    parameters: {
      filter?: { provider?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  StopRampA(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  TokenSwap(
    parameters: {
      filter?: { buyer?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Unpaused(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
}
export type SwapFlashLoanMethodNames =
  | 'MAX_BPS'
  | 'addLiquidity'
  | 'calculateRemoveLiquidity'
  | 'calculateRemoveLiquidityOneToken'
  | 'calculateSwap'
  | 'calculateTokenAmount'
  | 'flashLoan'
  | 'flashLoanFeeBPS'
  | 'getA'
  | 'getAPrecise'
  | 'getAdminBalance'
  | 'getToken'
  | 'getTokenBalance'
  | 'getTokenIndex'
  | 'getVirtualPrice'
  | 'initialize'
  | 'owner'
  | 'pause'
  | 'paused'
  | 'protocolFeeShareBPS'
  | 'rampA'
  | 'removeLiquidity'
  | 'removeLiquidityImbalance'
  | 'removeLiquidityOneToken'
  | 'renounceOwnership'
  | 'setAdminFee'
  | 'setFlashLoanFees'
  | 'setSwapFee'
  | 'stopRampA'
  | 'swap'
  | 'swapStorage'
  | 'transferOwnership'
  | 'unpause'
  | 'withdrawAdminFees';
export interface SwapStorageResponse {
  initialA: string;
  futureA: string;
  initialATime: string;
  futureATime: string;
  swapFee: string;
  adminFee: string;
  lpToken: string;
}
export interface SwapFlashLoan {
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MAX_BPS(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amounts Type: uint256[], Indexed: false
   * @param minToMint Type: uint256, Indexed: false
   * @param deadline Type: uint256, Indexed: false
   */
  addLiquidity(amounts: string[], minToMint: string, deadline: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  calculateRemoveLiquidity(amount: string): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenAmount Type: uint256, Indexed: false
   * @param tokenIndex Type: uint8, Indexed: false
   */
  calculateRemoveLiquidityOneToken(
    tokenAmount: string,
    tokenIndex: string | number
  ): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenIndexFrom Type: uint8, Indexed: false
   * @param tokenIndexTo Type: uint8, Indexed: false
   * @param dx Type: uint256, Indexed: false
   */
  calculateSwap(
    tokenIndexFrom: string | number,
    tokenIndexTo: string | number,
    dx: string
  ): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param amounts Type: uint256[], Indexed: false
   * @param deposit Type: bool, Indexed: false
   */
  calculateTokenAmount(amounts: string[], deposit: boolean): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param receiver Type: address, Indexed: false
   * @param token Type: address, Indexed: false
   * @param amount Type: uint256, Indexed: false
   * @param params Type: bytes, Indexed: false
   */
  flashLoan(
    receiver: string,
    token: string,
    amount: string,
    params: string | number[]
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  flashLoanFeeBPS(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getA(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAPrecise(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint256, Indexed: false
   */
  getAdminBalance(index: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint8, Indexed: false
   */
  getToken(index: string | number): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint8, Indexed: false
   */
  getTokenBalance(index: string | number): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenAddress Type: address, Indexed: false
   */
  getTokenIndex(tokenAddress: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getVirtualPrice(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pooledTokens Type: address[], Indexed: false
   * @param decimals Type: uint8[], Indexed: false
   * @param lpTokenName Type: string, Indexed: false
   * @param lpTokenSymbol Type: string, Indexed: false
   * @param _a Type: uint256, Indexed: false
   * @param _fee Type: uint256, Indexed: false
   * @param _adminFee Type: uint256, Indexed: false
   * @param lpTokenTargetAddress Type: address, Indexed: false
   */
  initialize(
    _pooledTokens: string[],
    decimals: string | number[],
    lpTokenName: string,
    lpTokenSymbol: string,
    _a: string,
    _fee: string,
    _adminFee: string,
    lpTokenTargetAddress: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  pause(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  paused(): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  protocolFeeShareBPS(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param futureA Type: uint256, Indexed: false
   * @param futureTime Type: uint256, Indexed: false
   */
  rampA(futureA: string, futureTime: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param minAmounts Type: uint256[], Indexed: false
   * @param deadline Type: uint256, Indexed: false
   */
  removeLiquidity(amount: string, minAmounts: string[], deadline: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amounts Type: uint256[], Indexed: false
   * @param maxBurnAmount Type: uint256, Indexed: false
   * @param deadline Type: uint256, Indexed: false
   */
  removeLiquidityImbalance(
    amounts: string[],
    maxBurnAmount: string,
    deadline: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenAmount Type: uint256, Indexed: false
   * @param tokenIndex Type: uint8, Indexed: false
   * @param minAmount Type: uint256, Indexed: false
   * @param deadline Type: uint256, Indexed: false
   */
  removeLiquidityOneToken(
    tokenAmount: string,
    tokenIndex: string | number,
    minAmount: string,
    deadline: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newAdminFee Type: uint256, Indexed: false
   */
  setAdminFee(newAdminFee: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newFlashLoanFeeBPS Type: uint256, Indexed: false
   * @param newProtocolFeeShareBPS Type: uint256, Indexed: false
   */
  setFlashLoanFees(newFlashLoanFeeBPS: string, newProtocolFeeShareBPS: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newSwapFee Type: uint256, Indexed: false
   */
  setSwapFee(newSwapFee: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  stopRampA(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenIndexFrom Type: uint8, Indexed: false
   * @param tokenIndexTo Type: uint8, Indexed: false
   * @param dx Type: uint256, Indexed: false
   * @param minDy Type: uint256, Indexed: false
   * @param deadline Type: uint256, Indexed: false
   */
  swap(
    tokenIndexFrom: string | number,
    tokenIndexTo: string | number,
    dx: string,
    minDy: string,
    deadline: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  swapStorage(): MethodConstantReturnContext<SwapStorageResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(newOwner: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  unpause(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  withdrawAdminFees(): MethodReturnContext;
}
