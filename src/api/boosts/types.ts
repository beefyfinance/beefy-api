import { ApiChain, AppChain } from '../../utils/chain';

export type PromoTokenRewardConfig = {
  type: 'token';
  address: string;
  symbol: string;
  decimals: number;
  oracleId: string;
  oracle: 'lps' | 'tokens';
  chainId?: AppChain;
};

/*type PromoPointsRewardConfig = {
  type: 'points';
  name: string;
};*/

export type PromoRewardConfig = PromoTokenRewardConfig /*| PromoPointsRewardConfig*/;

export type BasePromoConfig = {
  id: string;
  title: string;
  /** defaults to title */
  by?: string;
  vaultId: string;
  /** @deprecated use vaultId to retrieve from vault entity */
  assets: string[];
  /** @deprecated use vaultId to retrieve from vault entity */
  tokenAddress: string;
  tag?: {
    /** defaults to title */
    text?: string;
    /** default depending on type */
    icon?: string;
  };
  /** inactive before this time, `status` after */
  startTime?: number;
  /** `status` before this time, inactive after */
  endTime?: number;
  /** status, default inactive, can be overriden by start/endTime or type-specific logic (e.g. contract end time)  */
  status?: 'active' | 'prestake' | 'inactive';
  /** what the rewards are */
  rewards: PromoRewardConfig[];
  /** partners to show info box for */
  partners?: string[];
  /** campaign to show text/links from */
  campaign?: string;
};

type MakePromo<T> = BasePromoConfig & T;

export type BoostPromoConfig = MakePromo<{
  /** boost of vault via boost (v1) / reward pool (v2+) contract */
  type: 'boost';
  /** address of the boost contract */
  contractAddress: string;
  /** version of the boost contract 1 = boost 2 = reward pool */
  version?: number;
}>;

export type OffChainPromoConfig = MakePromo<{
  /** boost of vault via extra off chain merkl/stellaswap rewards */
  type: 'offchain';
  /** which `type` from our offchain api should this apply to */
  campaignType: string;
}>;

export type PoolPromoConfig = MakePromo<{
  /** boost of clm pool via extra rewards */
  type: 'pool';
}>;

export type AirdropPromoConfig = MakePromo<{
  /** boost of vault via airdrop */
  type: 'airdrop';
}>;

export type PromoConfig = BoostPromoConfig | OffChainPromoConfig | PoolPromoConfig | AirdropPromoConfig;

export type BoostEntity = Omit<BoostPromoConfig, 'version'> & {
  version: number;
  chain: ApiChain;
};

export type Boost = BoostEntity & {
  periodFinish: number;
  periodFinishes: number[];
};

export type OldBoost = {
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
  version?: number;
  periodFinish: number;
  periodFinishes: number[];
  campaign?: string;
};
