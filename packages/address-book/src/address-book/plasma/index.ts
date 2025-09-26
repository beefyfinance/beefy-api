import type { Chain } from '../../types/chain.js';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap.js';
import * as platforms from './platforms/index.js';
import { tokens } from './tokens/tokens.js';

export const plasma = {
  platforms,
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
  native: {
    symbol: 'WXPL',
    oracleId: 'XPL',
  },
} as const satisfies Chain;
