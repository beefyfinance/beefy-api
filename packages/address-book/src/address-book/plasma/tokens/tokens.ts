import type { Token } from '../../../types/token.js';

const XPL = {
  name: 'Wrapped XPL',
  address: '0x6100E367285b01F48D07953803A2d8dCA5D19873',
  symbol: 'WXPL',
  oracleId: 'WXPL',
  decimals: 18,
  chainId: 9745,
  website: 'https://www.plasma.to/',
  description: 'Plasma is a high-performance layer 1 blockchain purpose-built for stablecoins.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://docs.plasma.to/docs/get-started/introduction/start-here',
} as const satisfies Token;

export const tokens = {
  WNATIVE: XPL,
  FEES: XPL,
  XPL,
  WXPL: XPL,
  USDT0: {
    name: 'USDT0',
    symbol: 'USDT0',
    oracleId: 'USDT0',
    address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
    chainId: 9745,
    decimals: 6,
    logoURI: '',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'layer-zero',
    documentation: 'https://tether.to/en/how-it-works',
  },
  WETH: {
    name: 'Wrapped ETH',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0x9895D81bB462A195b4922ED7De0e3ACD007c32CB',
    chainId: 9745,
    decimals: 18,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    logoURI: '',
    documentation: 'https://ethereum.org/en/developers/docs/',
    bridge: 'layer-zero',
  },
  XAUt0: {
    name: 'XAUt0',
    symbol: 'XAUt0',
    oracleId: 'XAUt0',
    address: '0x1B64B9025EEbb9A6239575dF9Ea4b9Ac46D4d193',
    chainId: 9745,
    decimals: 18,
    logoURI: '',
    website: 'https://gold.usdt0.to/transfer',
    description:
      'Tether Gold tokens (XAUt) represents ownership of one troy ounce of physical gold held in a Swiss vault, combining the stability of precious metals with the utility of digital assets. It has become a trusted store of value for individuals and institutions seeking the security of gold without the burdens of physical custody. However, as the blockchain ecosystem expands, the movement of XAUT across chains remains disjointed and dependent on inconsistent bridging solutions, fragmented liquidity, and opaque backend processes that limit usability and access. ',
    bridge: 'layer-zero',
    documentation: 'https://usdt0.gitbook.io/xaut0',
  },
} as const satisfies Record<string, Token>;
