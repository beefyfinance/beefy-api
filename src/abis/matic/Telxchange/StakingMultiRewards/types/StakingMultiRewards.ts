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
  StakingMultiRewards,
  StakingMultiRewardsMethodNames,
  StakingMultiRewardsEventsContext,
  StakingMultiRewardsEvents
>;
export type StakingMultiRewardsEvents = 'RewardAdded' | 'RewardPaid' | 'Staked' | 'Withdrawn';
export interface StakingMultiRewardsEventsContext {
  RewardAdded(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RewardPaid(
    parameters: {
      filter?: { user?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Staked(
    parameters: {
      filter?: { user?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Withdrawn(
    parameters: {
      filter?: { user?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
}
export type StakingMultiRewardsMethodNames =
  | 'new'
  | 'balanceOf'
  | 'earned'
  | 'exit'
  | 'getReward'
  | 'getRewardRates'
  | 'getRewards'
  | 'getRewardsForDuration'
  | 'getRewardsPerTokenStored'
  | 'getRewardsTokens'
  | 'getUserRewardPerTokenPaid'
  | 'lastTimeRewardApplicable'
  | 'lastUpdateTime'
  | 'notifyRewardAmount'
  | 'periodFinish'
  | 'rewardRates'
  | 'rewards'
  | 'rewardsDistribution'
  | 'rewardsDuration'
  | 'rewardsPerToken'
  | 'rewardsPerTokenStored'
  | 'rewardsTokens'
  | 'stake'
  | 'stakeWithPermit'
  | 'stakingToken'
  | 'totalSupply'
  | 'userRewardPerTokenPaid'
  | 'withdraw';
export interface StakingMultiRewards {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _rewardsDistribution Type: address, Indexed: false
   * @param _rewardsTokens Type: address[], Indexed: false
   * @param _stakingToken Type: address, Indexed: false
   */
  'new'(
    _rewardsDistribution: string,
    _rewardsTokens: string[],
    _stakingToken: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  balanceOf(account: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  earned(account: string): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  exit(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  getReward(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getRewardRates(): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  getRewards(user: string): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getRewardsForDuration(): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getRewardsPerTokenStored(): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getRewardsTokens(): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  getUserRewardPerTokenPaid(user: string): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  lastTimeRewardApplicable(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  lastUpdateTime(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param addedRewards Type: uint256[], Indexed: false
   */
  notifyRewardAmount(addedRewards: string[]): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  periodFinish(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  rewardRates(parameter0: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  rewards(parameter0: string, parameter1: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  rewardsDistribution(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  rewardsDuration(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  rewardsPerToken(): MethodConstantReturnContext<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  rewardsPerTokenStored(parameter0: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  rewardsTokens(parameter0: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  stake(amount: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param deadline Type: uint256, Indexed: false
   * @param v Type: uint8, Indexed: false
   * @param r Type: bytes32, Indexed: false
   * @param s Type: bytes32, Indexed: false
   */
  stakeWithPermit(
    amount: string,
    deadline: string,
    v: string | number,
    r: string | number[],
    s: string | number[]
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  stakingToken(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalSupply(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  userRewardPerTokenPaid(
    parameter0: string,
    parameter1: string
  ): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  withdraw(amount: string): MethodReturnContext;
}
