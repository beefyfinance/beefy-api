import { ChainId } from 'blockchain-addressbook';

export interface LpPool {
  name: string;
  platform?: string;
  address: string;
  decimals: string;
  poolId?: number;
  chainId: ChainId;
  lp0: LpToken;
  lp1: LpToken;
}

export interface LpToken {
  address: string;
  oracle: 'tokens';
  oracleId: string;
  decimals: string;
}
