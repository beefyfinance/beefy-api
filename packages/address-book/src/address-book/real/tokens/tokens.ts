import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Re.Al Ether',
  address: '0x90c6E93849E06EC7478ba24522329d14A5954Df4',
  symbol: 'WREETH',
  oracleId: 'WREETH',
  decimals: 18,
  chainId: 111188,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'mode-canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WRETH: ETH,
  WNATIVE: ETH,
} as const satisfies Record<string, Token>;
