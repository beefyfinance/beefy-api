import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 4663,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'robinhood-canonical',
  documentation: 'https://ethereum.org/en/developers/docs/',
  tags: ['BLUECHIP'],
} as const satisfies Token;

export const tokens = {
  WNATIVE: ETH,
  FEES: ETH,
  ETH,
  WETH: ETH,
} as const satisfies Record<string, Token>;
