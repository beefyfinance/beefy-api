import { Address } from 'viem';

type SuccessResponse<T> = {
  isSuccess: true;
  code: 200;
  errors: null;
  message: string;
  result: T;
};

type ErrorResponse = {
  isSuccess: false;
  code: number;
  errors: unknown[];
  message: string;
};

type StellaResponse<T> = SuccessResponse<T> | ErrorResponse;

export type FarmingAprResult = {
  pools: {
    [poolAddress: string]: {
      apr: string;
      beefyApr: number | null;
      totalNativeAmount: string;
      totalNativeReward: string;
      tokenRewards: {
        [tokenAddress: string]: {
          id: string;
          name: string;
          symbol: string;
          derivedMatic: string;
          decimals: string;
          tokenRPS: string;
          glmrPerSecond: string;
          apr: string;
          beefyApr: number | null;
        };
      };
    };
  };
  updatedAt: string;
};

export type FarmingAprResponse = StellaResponse<FarmingAprResult>;

export type RewarderEntry = {
  poolAddress: Address;
  rewarderAddress: Address;
  isPaused: boolean;
};

export type RewardInfo = {
  rewardId: number;
  tokenAddress: Address;
  isNative: boolean;
  startTimestamp: number;
  endTimestamp: number;
  // rewardPerSec: bigint;
};
