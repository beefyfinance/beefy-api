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
  FarmHeroChef,
  FarmHeroChefMethodNames,
  FarmHeroChefEventsContext,
  FarmHeroChefEvents
>;
export type FarmHeroChefEvents =
  | 'Compound'
  | 'Deposit'
  | 'DepositNTF'
  | 'EmergencyWithdraw'
  | 'EmergencyWithdrawNFT'
  | 'FeeExclude'
  | 'OwnershipTransferred'
  | 'Paused'
  | 'SkipEOA'
  | 'Unpaused'
  | 'Withdraw'
  | 'WithdrawNFT';
export interface FarmHeroChefEventsContext {
  Compound(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  Deposit(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  DepositNTF(
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
  EmergencyWithdrawNFT(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  FeeExclude(
    parameters: {
      filter?: { user?: string | string[] };
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
  SkipEOA(
    parameters: {
      filter?: { user?: string | string[] };
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
  Withdraw(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
  WithdrawNFT(
    parameters: {
      filter?: { user?: string | string[]; pid?: string | string[] };
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
}
export type FarmHeroChefMethodNames =
  | 'HERO'
  | 'HEROMaxSupply'
  | 'HERORewardPerSecond'
  | 'add'
  | 'burnAddress'
  | 'calculateReward'
  | 'communityAddress'
  | 'communityRate'
  | 'compound'
  | 'compoundNotFee'
  | 'compoundPaused'
  | 'deposit'
  | 'depositNFT'
  | 'ecosystemAddress'
  | 'ecosystemRate'
  | 'emergencyWithdraw'
  | 'emergencyWithdrawNFT'
  | 'epochDuration'
  | 'epochReduceRate'
  | 'epochReward'
  | 'epochsLeft'
  | 'epochsPassed'
  | 'erc20PoolRate'
  | 'erc721PoolRate'
  | 'feeAddress'
  | 'feeExclude'
  | 'heroDistribution'
  | 'inCaseTokensGetStuck'
  | 'initialize'
  | 'massUpdatePools'
  | 'nftRewardRate'
  | 'onERC721Received'
  | 'owner'
  | 'pause'
  | 'paused'
  | 'pendingHERO'
  | 'playerBook'
  | 'poolExistence'
  | 'poolInfo'
  | 'poolLength'
  | 'referralRate'
  | 'referrals'
  | 'renounceOwnership'
  | 'reservedNFTFarmingAddress'
  | 'reservedNFTFarmingRate'
  | 'rewardDistribution'
  | 'set'
  | 'setAddresses'
  | 'setCompoundNotFee'
  | 'setCompoundPaused'
  | 'setEpochDuration'
  | 'setEpochReduceRate'
  | 'setFeeExclude'
  | 'setHEROMaxSupply'
  | 'setHeroDistribution'
  | 'setNftRewardRate'
  | 'setPlaybook'
  | 'setRates'
  | 'setReferralRate'
  | 'setRewardDistribution'
  | 'setSkipEOA'
  | 'setTotalEpoch'
  | 'setWithdrawFee'
  | 'skipEOA'
  | 'stakedWantTokens'
  | 'startAt'
  | 'startTime'
  | 'teamAddress'
  | 'teamRate'
  | 'totalAllocPoint'
  | 'totalEpoch'
  | 'transferOwnership'
  | 'unpause'
  | 'updatePool'
  | 'userInfo'
  | 'withdraw'
  | 'withdrawAll'
  | 'withdrawFee'
  | 'withdrawNFT';
export interface PoolInfoResponse {
  want: string;
  poolType: string;
  allocPoint: string;
  lastRewardTime: string;
  accHEROPerShare: string;
  strat: string;
}
export interface UserInfoResponse {
  shares: string;
  rewardDebt: string;
  gracePeriod: string;
  lastDepositBlock: string;
}
export interface FarmHeroChef {
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  HERO(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  HEROMaxSupply(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  HERORewardPerSecond(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _allocPoint Type: uint256, Indexed: false
   * @param _want Type: address, Indexed: false
   * @param _poolType Type: uint8, Indexed: false
   * @param _withUpdate Type: bool, Indexed: false
   * @param _strat Type: address, Indexed: false
   */
  add(
    _allocPoint: string,
    _want: string,
    _poolType: string | number,
    _withUpdate: boolean,
    _strat: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  burnAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _before Type: uint256, Indexed: false
   * @param _now Type: uint256, Indexed: false
   */
  calculateReward(_before: string, _now: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  communityAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  communityRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   */
  compound(_pid: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  compoundNotFee(): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  compoundPaused(): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _wantAmt Type: uint256, Indexed: false
   * @param _referName Type: string, Indexed: false
   */
  deposit(_pid: string, _wantAmt: string, _referName: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _tokenIds Type: uint256[], Indexed: false
   * @param _referName Type: string, Indexed: false
   */
  depositNFT(_pid: string, _tokenIds: string[], _referName: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  ecosystemAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  ecosystemRate(): MethodConstantReturnContext<string>;
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
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _tokenIds Type: uint256[], Indexed: false
   */
  emergencyWithdrawNFT(_pid: string, _tokenIds: string[]): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  epochDuration(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  epochReduceRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _epoch Type: uint256, Indexed: false
   */
  epochReward(_epoch: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  epochsLeft(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _time Type: uint256, Indexed: false
   */
  epochsPassed(_time: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  erc20PoolRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  erc721PoolRate(): MethodConstantReturnContext<string>;
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
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  feeExclude(parameter0: string): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  heroDistribution(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _token Type: address, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  inCaseTokensGetStuck(_token: string, _amount: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _hero Type: address, Indexed: false
   * @param _heroRewardPerSecond Type: uint256, Indexed: false
   * @param _disAddresses Type: address[], Indexed: false
   */
  initialize(
    _hero: string,
    _heroRewardPerSecond: string,
    _disAddresses: string[]
  ): MethodReturnContext;
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
  nftRewardRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param operator Type: address, Indexed: false
   * @param from Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  onERC721Received(
    operator: string,
    from: string,
    tokenId: string,
    data: string | number[]
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
   * @param _pid Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  pendingHERO(_pid: string, _user: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  playerBook(): MethodConstantReturnContext<string>;
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
  referralRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  referrals(parameter0: string): MethodConstantReturnContext<string>;
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
   */
  reservedNFTFarmingAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  reservedNFTFarmingRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  rewardDistribution(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _allocPoint Type: uint256, Indexed: false
   * @param _withUpdate Type: bool, Indexed: false
   */
  set(_pid: string, _allocPoint: string, _withUpdate: boolean): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _reservedNFTFarmingAddress Type: address, Indexed: false
   * @param _teamAddress Type: address, Indexed: false
   * @param _communityAddress Type: address, Indexed: false
   * @param _ecosystemAddress Type: address, Indexed: false
   */
  setAddresses(
    _reservedNFTFarmingAddress: string,
    _teamAddress: string,
    _communityAddress: string,
    _ecosystemAddress: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _notFee Type: bool, Indexed: false
   */
  setCompoundNotFee(_notFee: boolean): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _paused Type: bool, Indexed: false
   */
  setCompoundPaused(_paused: boolean): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _epochDuration Type: uint256, Indexed: false
   */
  setEpochDuration(_epochDuration: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _epochReduceRate Type: uint256, Indexed: false
   */
  setEpochReduceRate(_epochReduceRate: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _user Type: address, Indexed: false
   */
  setFeeExclude(_user: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _supply Type: uint256, Indexed: false
   */
  setHEROMaxSupply(_supply: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _heroDistribution Type: address, Indexed: false
   */
  setHeroDistribution(_heroDistribution: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _rate Type: uint256, Indexed: false
   */
  setNftRewardRate(_rate: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _playerBook Type: address, Indexed: false
   * @param _referralRate Type: uint256, Indexed: false
   */
  setPlaybook(_playerBook: string, _referralRate: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _teamRate Type: uint256, Indexed: false
   * @param _communityRate Type: uint256, Indexed: false
   * @param _ecosystemRate Type: uint256, Indexed: false
   * @param _reservedNFTFarmingRate Type: uint256, Indexed: false
   */
  setRates(
    _teamRate: string,
    _communityRate: string,
    _ecosystemRate: string,
    _reservedNFTFarmingRate: string
  ): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _referralRate Type: uint256, Indexed: false
   */
  setReferralRate(_referralRate: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _rewardDistribution Type: address, Indexed: false
   */
  setRewardDistribution(_rewardDistribution: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _user Type: address, Indexed: false
   */
  setSkipEOA(_user: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _totalEpoch Type: uint256, Indexed: false
   */
  setTotalEpoch(_totalEpoch: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _feeAddress Type: address, Indexed: false
   * @param _enable Type: bool, Indexed: false
   */
  setWithdrawFee(_feeAddress: string, _enable: boolean): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  skipEOA(parameter0: string): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  stakedWantTokens(_pid: string, _user: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _startTime Type: uint256, Indexed: false
   */
  startAt(_startTime: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  startTime(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  teamAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  teamRate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint8, Indexed: false
   */
  totalAllocPoint(parameter0: string | number): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalEpoch(): MethodConstantReturnContext<string>;
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
   * @param _pid Type: uint256, Indexed: false
   */
  updatePool(_pid: string): MethodReturnContext;
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
   * @param _wantAmt Type: uint256, Indexed: false
   */
  withdraw(_pid: string, _wantAmt: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   */
  withdrawAll(_pid: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  withdrawFee(): MethodConstantReturnContext<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _tokenIds Type: uint256[], Indexed: false
   */
  withdrawNFT(_pid: string, _tokenIds: string[]): MethodReturnContext;
}
