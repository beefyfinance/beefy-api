import type { ChainId } from '@beefyfinance/blockchain-addressbook';

export interface GmxPoolToken {
  address: string;
  decimals: string;
  oracleId: string;
}

export interface GmxPool {
  name: string;
  address: string;
  oracle: string;
  oracleId: string;
  strat: string;
  decimals: string;
  chainId: ChainId;
  stakedTracker?: string;
  glp?: boolean;
  glpManager?: string;
  vault?: string;
  tokens?: GmxPoolToken[];
}
