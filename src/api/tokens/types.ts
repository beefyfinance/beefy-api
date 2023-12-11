import { ApiChain } from '../../utils/chain';

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
  address: string;
  type: 'erc20';
};

export type TokenNative = TokenBase & {
  address: 'native';
  type: 'native';
};

export type TokenEntity = TokenErc20 | TokenNative;

export type ChainTokens = {
  byId: Record<TokenEntity['id'], TokenEntity['address']>;
  byAddress: Record<TokenEntity['address'], TokenEntity>;
};

export type TokensByChain = Record<ApiChain, ChainTokens>;
