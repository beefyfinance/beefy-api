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
  WETH: {
    name: 'WETH',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    chainId: 80094,
    decimals: 18,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
    documentation: 'https://ethereum.org/en/developers/docs/',
    bridge: 'layerzero',
  },
} as const satisfies Record<string, Token>;
