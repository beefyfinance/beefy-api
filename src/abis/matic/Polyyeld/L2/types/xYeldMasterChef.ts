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
  XYeldMasterChef,
  XYeldMasterChefMethodNames,
  XYeldMasterChefEventsContext,
  XYeldMasterChefEvents
>;
export type XYeldMasterChefEvents =
  | 'Deposit'
  | 'EmergencyWithdraw'
  | 'OwnershipTransferred'
  | 'ReferralCommissionPaid'
  | 'SetDevAddress'
  | 'SetFeeAddress'
  | 'SetReferralAddress'
  | 'SetVaultAddress'
  | 'UpdateEmissionRate'
  | 'Withdraw';
export interface XYeldMasterChefEventsContext {
  Deposit(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  EmergencyWithdraw(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
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
  ReferralCommissionPaid(
    parameters: {
      filter?: { user?: string | string[]; referrer?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  SetDevAddress(
    parameters: {
      filter?: { user?: string | string[]; newAddress?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  SetFeeAddress(
    parameters: {
      filter?: { user?: string | string[]; newAddress?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  SetReferralAddress(
    parameters: {
      filter?: { user?: string | string[]; newAddress?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  SetVaultAddress(
    parameters: {
      filter?: { user?: string | string[]; newAddress?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  UpdateEmissionRate(
    parameters: {
      filter?: { user?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Withdraw(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
}
export type XYeldMasterChefMethodNames =
  | 'new'
  | 'MAXIMUM_REFERRAL_COMMISSION_RATE'
  | 'Yeld'
  | '_exclude'
  | '_updateSwapAndLiquifyEnabled'
  | 'add'
  | 'deposit'
  | 'devAddress'
  | 'emergencyWithdraw'
  | 'feeAddress'
  | 'getMultiplier'
  | 'massUpdatePools'
  | 'owner'
  | 'pendingYeld'
  | 'poolExistence'
  | 'poolInfo'
  | 'poolLength'
  | 'referral'
  | 'referralCommissionRate'
  | 'renounceOwnership'
  | 'set'
  | 'setDevAddress'
  | 'setFeeAddress'
  | 'setReferralAddress'
  | 'setReferralCommissionRate'
  | 'startBlock'
  | 'totalAllocPoint'
  | 'transferOwnership'
  | 'updateEmissionRate'
  | 'updatePool'
  | 'updateStartBlock'
  | 'userInfo'
  | 'withdraw'
  | 'xYeldPerBlock';
export interface PoolInfoResponse {
  lpToken: string;
  allocPoint: string;
  lastRewardBlock: string;
  accYeldPerShare: string;
  depositFeeBP: string;
}
export interface UserInfoResponse {
  amount: string;
  rewardDebt: string;
}
export interface XYeldMasterChef {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _Yeld Type: address, Indexed: false
   * @param _startBlock Type: uint256, Indexed: false
   * @param _devAddress Type: address, Indexed: false
   * @param _feeAddress Type: address, Indexed: false
   */
  'new'(
    _Yeld: string,
    _startBlock: string,
    _devAddress: string,
    _feeAddress: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MAXIMUM_REFERRAL_COMMISSION_RATE(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  Yeld(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _add Type: address, Indexed: false
   */
  _exclude(_add: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _bool Type: bool, Indexed: false
   */
  _updateSwapAndLiquifyEnabled(_bool: boolean): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _allocPoint Type: uint256, Indexed: false
   * @param _lpToken Type: address, Indexed: false
   * @param _depositFeeBP Type: uint16, Indexed: false
   */
  add(_allocPoint: string, _lpToken: string, _depositFeeBP: string | number): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param _referrer Type: address, Indexed: false
   */
  deposit(_pid: string, _amount: string, _referrer: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  devAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   */
  emergencyWithdraw(_pid: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  feeAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param _from Type: uint256, Indexed: false
   * @param _to Type: uint256, Indexed: false
   */
  getMultiplier(_from: string, _to: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  massUpdatePools(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  pendingYeld(_pid: string, _user: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  poolExistence(parameter0: string): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  poolInfo(parameter0: string): MethodConstantReturnContext<PoolInfoResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  poolLength(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  referral(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  referralCommissionRate(): MethodConstantReturnContext<string>;
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
   * @param _pid Type: uint256, Indexed: false
   * @param _allocPoint Type: uint256, Indexed: false
   * @param _depositFeeBP Type: uint16, Indexed: false
   */
  set(_pid: string, _allocPoint: string, _depositFeeBP: string | number): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _devAddress Type: address, Indexed: false
   */
  setDevAddress(_devAddress: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _feeAddress Type: address, Indexed: false
   */
  setFeeAddress(_feeAddress: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _referral Type: address, Indexed: false
   */
  setReferralAddress(_referral: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _referralCommissionRate Type: uint16, Indexed: false
   */
  setReferralCommissionRate(_referralCommissionRate: string | number): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  startBlock(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalAllocPoint(): MethodConstantReturnContext<string>;
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
   * @param _xYeldPerBlock Type: uint256, Indexed: false
   */
  updateEmissionRate(_xYeldPerBlock: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   */
  updatePool(_pid: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _startBlock Type: uint256, Indexed: false
   */
  updateStartBlock(_startBlock: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   */
  userInfo(parameter0: string, parameter1: string): MethodConstantReturnContext<UserInfoResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  withdraw(_pid: string, _amount: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  xYeldPerBlock(): MethodConstantReturnContext<string>;
}
