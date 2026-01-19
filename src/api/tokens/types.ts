import { ApiChain } from '../../utils/chain';
import { Address } from 'viem';

type TokenBase = {
  id: string;
  name: string;
  symbol: string;
  chainId: ApiChain;
  oracleId: string;
  oracle: 'lps' | 'tokens';
  decimals: number;
  bridge?: string;
  staked?: boolean;
};

export type TokenErc20 = TokenBase & {
  /** checksummed address */
  address: Address;
  type: 'erc20';
};

export type TokenNative = TokenBase & {
  address: 'native';
  type: 'native';
};

export type TokenEntity = TokenErc20 | TokenNative;

export type ChainTokens = {
  /** lowercase address */
  byId: Record<TokenEntity['id'], string>;
  /** lowercase address */
  byAddress: Record<string, TokenEntity>;
};

export type TokensByChain = Record<ApiChain, ChainTokens>;
