import type Token from '../types/token';

export interface Version {
  major: number;
  minor: number;
  patch: number;
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
