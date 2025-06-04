import type { Token } from '../../../types/token.js';

const HYPE = {
  name: 'Wrapped HYPE',
  address: '0x5555555555555555555555555555555555555555',
  symbol: 'WHYPE',
  oracleId: 'WHYPE',
  decimals: 18,
  chainId: 999,
  website: 'https://app.hyperliquid.xyz/trade',
  description:
    'Hyperliquid is a performant blockchain built with the vision of a fully onchain open financial system. Liquidity, user applications, and trading activity synergize on a unified platform that will ultimately house all of finance. ',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://hyperliquid.gitbook.io/hyperliquid-docs',
} as const satisfies Token;

export const tokens = {
  HYPE,
  WHYPE: HYPE,
  WNATIVE: HYPE,
  FEES: HYPE,
} as const satisfies Record<string, Token>;
