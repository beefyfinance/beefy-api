import type { Token } from '../../../types/token.js';

const USDC = {
  name: 'USD Coin',
  address: '0x3600000000000000000000000000000000000000',
  symbol: 'USDC',
  oracleId: 'USDC',
  decimals: 6,
  chainId: 5042,
  website: 'https://www.circle.com/usdc',
  description:
    'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  bridge: 'arc-canonical',
  documentation: 'https://developers.circle.com/docs',
  tags: ['STABLECOIN'],
} as const satisfies Token;

export const tokens = {
  // No wrapper on arc: 0x3600 is the 6-decimal ERC-20 view of the 18-decimal native balance (no deposit/withdraw)
  WNATIVE: USDC,
  FEES: USDC,
  USDC,
  WUSDC: USDC,
} as const satisfies Record<string, Token>;
