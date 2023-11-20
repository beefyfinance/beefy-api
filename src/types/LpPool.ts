import { ChainId } from '../../packages/address-book/address-book';
import { PriceOracle } from '../utils/fetchPrice.js';

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
  beefyFee?: number;
  extraRewards?: Reward[];
  tokens?: LpToken[];
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
  beefyFee?: number;
  extraRewards?: Reward[];
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
