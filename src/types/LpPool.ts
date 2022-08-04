import BigNumber from 'bignumber.js';
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
  chainId: ChainId | string;
  lp0: LpToken;
  lp1: LpToken;
  oracle?: string;
  oracleId?: string;
  depositFee?: number;
  beefyFee?: number;
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
}

export interface LpToken {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
}

/**
 * Current balance implementation modifies the lp pool object
 * This type reflect the current implementation but is not the desired implementation
 * A desired implementation would be to have an immutable LpPool object and an additional parameter for the balance
 */
export type LpTokenWithBalance = LpToken & { balance: BigNumber };
export type LpPoolWithBalance = Omit<LpPool, 'lp0' | 'lp1'> & {
  lp0: LpTokenWithBalance;
  lp1: LpTokenWithBalance;
  totalSupply: BigNumber;
};

export interface MultiAssetPool {
  name: string;
  address: string;
  vault: string;
  gauge?: string;
  vaultPoolId: string;
  decimals: string;
  rewards?: {
    stream: string;
    token: string;
    oracleId: string;
  }[];
  tokens: {
    oracle: string;
    oracleId: string;
    decimals: string;
  }[];
}

export type AnyPool = LpPool | SingleAssetPool | MultiAssetPool;

export interface LpBreakdownData {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
}

export interface LpBreakdowns {
  [key: string]: LpBreakdownData;
}
