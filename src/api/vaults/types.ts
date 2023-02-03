import BigNumber from 'bignumber.js';

export type Vault = {
  id: string;
  name: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenProviderId: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: 'tokens';
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets: string[];
  strategyTypeId: string;
  risks: string[];
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: string;
  strategy: string;
  lastHarvest?: number;
  pricePerFullShare: BigNumber;
  createdAt: number;
};
