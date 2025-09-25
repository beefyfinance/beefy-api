import type { Token } from '../../../types/token.js';

const XPL = {
  name: 'Wrapped XPL',
  address: '0x6100E367285b01F48D07953803A2d8dCA5D19873',
  symbol: 'WXPL',
  oracleId: 'WXPL',
  decimals: 18,
  chainId: 9745,
  website: 'https://www.plasma.to/',
  description: 'Plasma is a high-performance layer 1 blockchain purpose-built for stablecoins.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://docs.plasma.to/docs/get-started/introduction/start-here',
} as const satisfies Token;

export const tokens = {
  WNATIVE: XPL,
  FEES: XPL,
  XPL,
  WXPL: XPL,
} as const satisfies Record<string, Token>;
