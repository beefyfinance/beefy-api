import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether ',
  address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 169,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
} as const satisfies Record<string, Token>;
