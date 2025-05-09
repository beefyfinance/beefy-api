import type { Token } from '../../../types/token.js';

const GAS = {
  name: 'Wrapped Gas',
  address: '0xE3dbcD53f4Ce1b06Ab200f4912BD35672e68f1FA', // TODO set correct saga address
  symbol: 'WGAS',
  oracleId: 'WGAS',
  decimals: 18,
  chainId: 5464,
  website: 'https://www.saga.xyz/',
  description: 'Meta-token for gas on Saga. Saga is gasless for users.',
  bridge: 'native',
  logoURI: '',
  documentation: 'https://docs.saga.xyz/',
} as const satisfies Token;

export const tokens = {
  GAS,
  WGAS: GAS,
  WNATIVE: GAS,
} as const satisfies Record<string, Token>;
