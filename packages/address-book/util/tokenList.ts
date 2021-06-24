export interface Version {
  major: number;
  minor: number;
  patch: number;
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: Version;
  tags?: Record<string, unknown>;
  logoURI: string;
  keywords: string[];
  tokens: Token[];
}
