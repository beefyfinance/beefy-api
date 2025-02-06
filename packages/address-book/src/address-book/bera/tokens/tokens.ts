import type { Token } from '../../../types/token.js';

const BERA = {
  name: 'Wrapped Bera',
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'WBERA',
  oracleId: 'WBERA',
  decimals: 18,
  chainId: 80094,
  website: 'https://www.berachain.com/',
  description: 'Learn, integrate, and build on a new modular EVM with Berachain.',
  bridge: 'bera-canonical',
  logoURI: '',
  documentation: 'https://docs.berachain.com/',
} as const satisfies Token;

export const tokens = {
  BERA,
  WBERA: BERA,
  WNATIVE: BERA,
} as const satisfies Record<string, Token>;
