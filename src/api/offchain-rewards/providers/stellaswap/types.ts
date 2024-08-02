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

type FarmingAprResult = {
  pools: {
    [poolAddress: string]: {
      apr: string;
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
        };
      };
    };
  };
  updatedAt: string;
};

type FarmingAprResponse = StellaResponse<FarmingAprResult>;
