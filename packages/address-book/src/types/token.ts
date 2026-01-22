export interface Token {
  name: string;
  symbol: string;
  oracleId: string;
  address: string;
  chainId: number;
  decimals: number;
  description?: string;
  website?: string;
  documentation?: string;
  oracle?: 'tokens' | 'lps';
  bridge?: string;
  staked?: boolean;
  tags?: ReadonlyArray<
    | 'NO_TIMELOCK'
    | 'STABLECOIN'
    | 'SYNTHETIC'
    | 'CURATED'
    | 'LARGE_HOLDERS'
    | 'BLUECHIP'
    | 'MEMECOIN'
  >;
}

export interface TokenWithId extends Token {
  id: string;
}

// back-compat
export type { Token as default };
