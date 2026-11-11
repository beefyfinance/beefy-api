export interface LpPool {
  name: string;
  farmType?: string;
  platform?: string;
  rewardPool?: string;
  address: string;
  strat?: string;
  decimals: string;
  poolId?: number;
  lp0: LpToken;
  lp1: LpToken;
  oracle?: string;
  oracleId?: string;
  depositFee?: number;
  beefyFee?: number;
  extraRewards?: Reward[];
  tokens?: LpToken[];
}

export interface LpToken {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
}

export interface Reward {
  rewarder: string;
  oracleId: string;
  decimals: string;
}
