export interface Token {
  name: string;
  symbol: string;
  oracleId: string;
  address: string;
  chainId: number;
  decimals: number;
  description?: string;
  website?: string;
  logoURI?: string;
  documentation?: string;
  oracle?: 'tokens' | 'lps';
  bridge?: string;
  staked?: boolean;
  risks?: ReadonlyArray<'NO_TIMELOCK' | 'LARGE_HOLDERS'>;
}

export interface TokenWithId extends Token {
  id: string;
}

// back-compat
export type { Token as default };
