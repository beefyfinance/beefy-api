
import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x5300000000000000000000000000000000000004',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 534352, 
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'scroll-canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  USDC: {
    name: 'USD Coin',
    address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'scroll-canonical',
    chainId: 534352,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
  },
  WBTC: {
    chainId: 534352,
    address: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    oracleId: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    bridge: 'scroll-canonical',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
    chainId: 534352,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'scroll-canonical',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
    documentation: 'https://tether.to/en/how-it-works',
  },
} as const satisfies Record<string, Token>;
