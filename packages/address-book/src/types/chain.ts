import type { BeefyFinance } from './beefyfinance.js';
import type { Token, TokenWithId } from './token.js';

export interface Chain {
  readonly platforms: Record<string, Record<string, string>> & {
    beefyfinance: BeefyFinance;
  };
  readonly tokens: { WNATIVE: Token; FEES: Token } & { [id: string]: Token };
  readonly tokenAddressMap: Record<string, TokenWithId>;
  readonly native: {
    readonly symbol: string;
    readonly oracleId: string;
    /** Only needed when it differs from WNATIVE.decimals (e.g. arc) */
    readonly decimals?: number;
  };
}

// back-compat
export type { Chain as default };
