import { ChainId } from '../../packages/address-book/address-book';

export interface LpPool {
  name: string;
  farmType?: string;
  platform?: string;
  rewardPool?: string;
  address: string;
  strat?: string;
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
  strat?: string;
  oracle?: string;
  oracleId?: string;
  decimals: string;
  chainId: ChainId;
  depositFee?: number;
  swap?: string; // used in swap contracts, like IronSwap (0x837503e8A8753ae17fB8C8151B8e6f586defCb57) on polygon
}

export interface LpToken {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
}
