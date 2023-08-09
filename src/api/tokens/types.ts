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
