import type { Token } from '../../../types/token.js';

const GAS = {
  name: 'USDC',
  address: '0xfc960C233B8E98e0Cf282e29BDE8d3f105fc24d5',
  symbol: 'USDC',
  oracleId: 'USDC',
  decimals: 6,
  chainId: 5464,
  website: 'https://www.centre.io/',
  description:
    'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  bridge: 'saga-canonical',
  logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
} as const satisfies Token;

export const tokens = {
  GAS,
  WGAS: GAS,
  WNATIVE: GAS,
  USDC: GAS,
} as const satisfies Record<string, Token>;
