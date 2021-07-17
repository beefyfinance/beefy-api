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
  oracle?: string;
  oracleId?: string;
  depositFee?: number;
}

export interface SingleAssetPool {
  name: string;
  farmType?: string;
  poolId?: number;
  address: string;
  oracle?: string;
  oracleId?: string;
  decimals: string;
  chainId: ChainId;
  depositFee?: number;
}

export interface LpToken {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
}
