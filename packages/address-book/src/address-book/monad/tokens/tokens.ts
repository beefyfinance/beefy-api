import type { Token } from '../../../types/token.js';

const MON = {
  name: 'Wrapped Monad',
  address: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
  symbol: 'WMON',
  oracleId: 'WMON',
  decimals: 18,
  chainId: 143,
  website: 'https://www.monad.xyz/',
  description:
    'Monad is a next-generation, Ethereum-compatible chain delivering 10,000 TPS, sub-second finality, low fees, and scalable decentralization. All in one.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://www.monad.xyz/build',
} as const satisfies Token;

export const tokens = {
  MON,
  WMON: MON,
  WNATIVE: MON,
  FEES: MON,
  USDC: {
    name: 'USD Coin',
    address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'native',
    chainId: 143,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
  },
} as const satisfies Record<string, Token>;
