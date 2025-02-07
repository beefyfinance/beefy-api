import type { Token } from '../../../types/token.js';

const BERA = {
  name: 'Wrapped Bera',
  address: '0x6969696969696969696969696969696969696969',
  symbol: 'WBERA',
  oracleId: 'WBERA',
  decimals: 18,
  chainId: 80094,
  website: 'https://www.berachainchain.com/',
  description: 'Learn, integrate, and build on a new modular EVM with Berachain.',
  bridge: 'berachain-canonical',
  logoURI: '',
  documentation: 'https://docs.berachainchain.com/',
} as const satisfies Token;

export const tokens = {
  BERA,
  WBERA: BERA,
  WNATIVE: BERA,
} as const satisfies Record<string, Token>;
