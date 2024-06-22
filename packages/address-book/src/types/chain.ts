import type { BeefyFinance } from './beefyfinance.js';
import type { Token, TokenWithId } from './token.js';

export interface Chain {
  readonly platforms: Record<string, Record<string, string>> & {
    beefyfinance: BeefyFinance;
  };
  readonly tokens: Record<string, Token>;
  readonly tokenAddressMap: Record<string, TokenWithId>;
}

// back-compat
export type { Chain as default };
