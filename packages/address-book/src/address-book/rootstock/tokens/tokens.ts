import type { Token } from '../../../types/token.js';

const RBTC = {
  name: 'Wrapped Rootstock BTC',
  address: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
  symbol: 'WRBTC',
  oracleId: 'WRBTC',
  decimals: 18,
  chainId: 30,
  website: 'https://rootstock.io/rbtc/',
  description: 'RBTC, the smart version of Bitcoin.Allowing BTC owners to interact with DeFi protocols and dApps on Rootstock network for minting, swaps, gas fees and more.',
  bridge: 'rootstock-canonical',
  logoURI: '',
  documentation: 'https://dev.rootstock.io/concepts/rbtc/?_gl=1*jp93v6*_gcl_au*ODQ3NTgwNDM3LjE3MjcyNjIwNDI.',
} as const satisfies Token;

export const tokens = {
  RBTC,
  WRBTC: RBTC,
  WNATIVE: RBTC,
} as const satisfies Record<string, Token>;
