
import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: https://rpc.api.lisk.com, 
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
} as const satisfies Record<string, Token>;
