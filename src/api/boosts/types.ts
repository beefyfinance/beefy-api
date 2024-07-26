import { ApiChain } from '../../utils/chain';

export type BoostConfig = {
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
  version: number;
  chain: ApiChain;
};

export type Boost = BoostConfig & {
  periodFinish: number;
  periodFinishes: number[];
};
