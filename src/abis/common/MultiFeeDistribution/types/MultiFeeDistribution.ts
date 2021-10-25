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
  MultiFeeDistribution,
  MultiFeeDistributionMethodNames,
  MultiFeeDistributionEventsContext,
  MultiFeeDistributionEvents
>;
export type MultiFeeDistributionEvents =
  | 'OwnershipTransferred'
  | 'Recovered'
  | 'RewardAdded'
  | 'RewardPaid'
  | 'RewardsDurationUpdated'
  | 'Staked'
  | 'Withdrawn';
export interface MultiFeeDistributionEventsContext {
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
  Recovered(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
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
      filter?: { user?: string | string[]; rewardsToken?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  RewardsDurationUpdated(
    parameters: {
      filter?: {};
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
export type MultiFeeDistributionMethodNames =
  | 'new'
  | 'addReward'
  | 'approveRewardDistributor'
  | 'claimableRewards'
  | 'earnedBalances'
  | 'exit'
  | 'getReward'
  | 'getRewardForDuration'
  | 'lastTimeRewardApplicable'
  | 'lockDuration'
  | 'lockedBalances'
  | 'lockedSupply'
  | 'mint'
  | 'minters'
  | 'notifyRewardAmount'
  | 'owner'
  | 'recoverERC20'
  | 'renounceOwnership'
  | 'rewardData'
  | 'rewardDistributors'
  | 'rewardPerToken'
  | 'rewardTokens'
  | 'rewards'
  | 'rewardsDuration'
  | 'stake'
  | 'stakingToken'
  | 'totalBalance'
  | 'totalSupply'
  | 'transferOwnership'
  | 'unlockedBalance'
  | 'userRewardPerTokenPaid'
  | 'withdraw'
  | 'withdrawExpiredLocks'
  | 'withdrawableBalance';
export interface RewardsResponse {
  token: string;
  amount: string;
}
export interface EarningsDataResponse {
  amount: string;
  unlockTime: string;
}
export interface EarnedBalancesResponse {
  total: string;
  earningsData: EarningsDataResponse[];
}
export interface LockDataResponse {
  amount: string;
  unlockTime: string;
}
export interface LockedBalancesResponse {
  total: string;
  unlockable: string;
  locked: string;
  lockData: LockDataResponse[];
}
export interface RewardDataResponse {
  periodFinish: string;
  rewardRate: string;
  lastUpdateTime: string;
  rewardPerTokenStored: string;
}
export interface WithdrawableBalanceResponse {
  amount: string;
  penaltyAmount: string;
}
export interface MultiFeeDistribution {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _stakingToken Type: address, Indexed: false
   * @param _minters Type: address[], Indexed: false
   */
  'new'(_stakingToken: string, _minters: string[]): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _rewardsToken Type: address, Indexed: false
   * @param _distributor Type: address, Indexed: false
   */
  addReward(_rewardsToken: string, _distributor: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _rewardsToken Type: address, Indexed: false
   * @param _distributor Type: address, Indexed: false
   * @param _approved Type: bool, Indexed: false
   */
  approveRewardDistributor(
    _rewardsToken: string,
    _distributor: string,
    _approved: boolean
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  claimableRewards(account: string): MethodConstantReturnContext<RewardsResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  earnedBalances(user: string): MethodConstantReturnContext<EarnedBalancesResponse>;
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
   * @param _rewardsToken Type: address, Indexed: false
   */
  getRewardForDuration(_rewardsToken: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _rewardsToken Type: address, Indexed: false
   */
  lastTimeRewardApplicable(_rewardsToken: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  lockDuration(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  lockedBalances(user: string): MethodConstantReturnContext<LockedBalancesResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  lockedSupply(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param user Type: address, Indexed: false
   * @param amount Type: uint256, Indexed: false
   */
  mint(user: string, amount: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  minters(parameter0: string): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _rewardsToken Type: address, Indexed: false
   * @param reward Type: uint256, Indexed: false
   */
  notifyRewardAmount(_rewardsToken: string, reward: string): MethodReturnContext;
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
   * @param tokenAddress Type: address, Indexed: false
   * @param tokenAmount Type: uint256, Indexed: false
   */
  recoverERC20(tokenAddress: string, tokenAmount: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  rewardData(parameter0: string): MethodConstantReturnContext<RewardDataResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   */
  rewardDistributors(parameter0: string, parameter1: string): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _rewardsToken Type: address, Indexed: false
   */
  rewardPerToken(_rewardsToken: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  rewardTokens(parameter0: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   */
  rewards(parameter0: string, parameter1: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  rewardsDuration(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param lock Type: bool, Indexed: false
   */
  stake(amount: string, lock: boolean): MethodReturnContext;
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
   * @param user Type: address, Indexed: false
   */
  totalBalance(user: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalSupply(): MethodConstantReturnContext<string>;
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
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  unlockedBalance(user: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
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
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  withdrawExpiredLocks(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   */
  withdrawableBalance(user: string): MethodConstantReturnContext<WithdrawableBalanceResponse>;
}
