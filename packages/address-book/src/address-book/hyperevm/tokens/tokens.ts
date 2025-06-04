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
  USDT0: {
    name: 'USDT0',
    symbol: 'USDT0',
    oracleId: 'USDT0',
    address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
    chainId: 999,
    decimals: 6,
    logoURI: '',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'layer-zero',
    documentation: 'https://tether.to/en/how-it-works',
  },
} as const satisfies Record<string, Token>;
