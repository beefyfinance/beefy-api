import BigNumber from 'bignumber.js';
import { ApiChain, AppChain } from '../../utils/chain';

export type Vault = {
  id: string;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number;
  earnedOracleId?: string;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets?: string[];
  strategyTypeId: string;
  risks: string[];
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: AppChain;
  /** @deprecated */
  isGovVault?: boolean;
  type: 'standard' | 'gov';
  strategy: string;
  lastHarvest?: number;
  pricePerFullShare: BigNumber;
  createdAt: number;
  chain: ApiChain;
};

export type GovVault = {
  id: string;
  name: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals: number;
  earnContractAddress: string;
  oracle: 'lps' | 'tokens';
  oracleId: string;
  status: 'active' | 'paused' | 'eol';
  platformId: string;
  assets: string[];
  risks: string[];
  strategyTypeId: string;
  isGovVault: boolean;
  network: AppChain;
  createdAt: number;
  totalSupply: number;
  chain: ApiChain;
};
