export type Boost = {
  id: string;
  poolId: string;
  name: string;
  assets: string[];
  tokenAddress: string;
  earnedToken: string;
  earnedTokenDecimals: number;
  earnedTokenAddress: string;
  earnContractAddress: string;
  earnedOracle: 'tokens' | 'lps';
  earnedOracleId: string;
  partnership: boolean;
  status: 'active' | 'prestake' | 'closed';
  isMooStaked: boolean;
  partners: string[];
  chain: string;
  periodFinish: number;
};
