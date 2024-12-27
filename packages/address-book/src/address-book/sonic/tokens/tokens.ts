import type { Token } from '../../../types/token.js';

const S = {
  name: 'Wrapped S',
  address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
  symbol: 'wS',
  oracleId: 'wS',
  decimals: 18,
  chainId: 146,
  website: 'https://www.soniclabs.com/',
  description:
    'Wrapped S, (S) Sonic is an EVM layer-1 platform that offers developers attractive incentives and powerful infrastructure.',
  bridge: 'sonic-canonical',
  logoURI: '',
  documentation: 'https://www.soniclabs.com/developer-resources',
} as const satisfies Token;

export const tokens = {
  S,
  WS: S,
  WNATIVE: S,
  EQUAL: {
    name: 'Equalizer on Sonic',
    symbol: 'EQUAL',
    oracleId: 'EQUAL',
    address: '0xddF26B42C1d903De8962d3F79a74a501420d5F19',
    chainId: 146,
    decimals: 18,
    logoURI: '',
    website: 'https://sonic.equalizer.exchange/',
    description:
      'Equalizer Exchange is the fastest liquidity hub providing optimized trading and earning opportunities.',
    documentation: '',
    bridge: 'native',
  },
  USDCe: {
    name: 'Bridged USDC (Sonic Labs)',
    symbol: 'USDC.e',
    oracleId: 'sUSDCe',
    address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    chainId: 146,
    decimals: 6,
    logoURI: '',
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    documentation: '',
    bridge: 'sonic-canonical',
  },
  WETH: {
    name: 'Wrapped Ether on Sonic',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b',
    chainId: 146,
    decimals: 18,
    logoURI: '',
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'sonic-canonical',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
} as const satisfies Record<string, Token>;
