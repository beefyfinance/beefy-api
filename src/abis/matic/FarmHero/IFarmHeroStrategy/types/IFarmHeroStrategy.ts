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
  IFarmHeroStrategy,
  IFarmHeroStrategyMethodNames,
  IFarmHeroStrategyEventsContext,
  IFarmHeroStrategyEvents
>;
export type IFarmHeroStrategyEvents = undefined;
export interface IFarmHeroStrategyEventsContext {}
export type IFarmHeroStrategyMethodNames =
  | 'deposit'
  | 'deposit'
  | 'earn'
  | 'entranceFeeFactor'
  | 'inCaseTokensGetStuck'
  | 'sharesTotal'
  | 'wantLockedTotal'
  | 'withdraw'
  | 'withdraw';
export interface IFarmHeroStrategy {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _userAddress Type: address, Indexed: false
   * @param _wantAmt Type: uint256, Indexed: false
   */
  deposit(_userAddress: string, _wantAmt: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _userAddress Type: address, Indexed: false
   * @param _tokenIds Type: uint256[], Indexed: false
   */
  deposit(_userAddress: string, _tokenIds: string[]): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  earn(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  entranceFeeFactor(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _token Type: address, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param _to Type: address, Indexed: false
   */
  inCaseTokensGetStuck(_token: string, _amount: string, _to: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  sharesTotal(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  wantLockedTotal(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _userAddress Type: address, Indexed: false
   * @param _tokenIds Type: uint256[], Indexed: false
   */
  withdraw(_userAddress: string, _tokenIds: string[]): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _userAddress Type: address, Indexed: false
   * @param _wantAmt Type: uint256, Indexed: false
   */
  withdraw(_userAddress: string, _wantAmt: string): MethodReturnContext;
}
