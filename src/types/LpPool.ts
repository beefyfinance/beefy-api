import { ChainId } from '../../packages/address-book/address-book';

export interface LpPool {
  name: string;
  farmType?: string;
  platform?: string;
  rewardPool?: string;
  address: string;
  decimals: string;
  poolId?: number;
  chainId: ChainId;
  lp0: LpToken;
  lp1: LpToken;
  oracle: string;
  oracleId: string;
  depositFee?: number;
}

export interface LpToken {
  address: string;
  oracle: 'tokens';
  oracleId: string;
  decimals: string;
}
