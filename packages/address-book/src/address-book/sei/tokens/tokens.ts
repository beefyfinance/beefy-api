import type { Token } from '../../../types/token.js';

const SEI = {
  name: 'Wrapped SEI',
  address: '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7',
  symbol: 'WSEI',
  oracleId: 'WSEI',
  decimals: 18,
  chainId: 1329,
  website: 'https://www.sei.io/',
  description:
    'Pushing the boundaries of blockchain technology through open source development, Sei stands to unlock a brand new design space for consumer facing applications.',
  bridge: 'native',
  logoURI: '',
  documentation: 'https://www.docs.sei.io/',
} as const satisfies Token;

export const tokens = {
  SEI,
  WSEI: SEI,
  WNATIVE: SEI,
  USDC: {
    name: 'USD Coin',
    address: '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description: 'Sei-based USDC bridged via the official SEI Bridge.',
    bridge: 'sei-canonical',
    chainId: 1329,
    documentation: 'https://developers.circle.com/docs',
  },
  WETH: {
    name: 'Wrapped Ether',
    address: '0x160345fC359604fC6e70E3c5fAcbdE5F7A9342d8',
    symbol: 'WETH',
    oracleId: 'WETH',
    decimals: 18,
    chainId: 1329,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'layerzero',
    logoURI: '',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xB75D0B03c06A926e488e2659DF1A861F860bD3d1',
    chainId: 1329,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'sei-canonical',
    logoURI: '',
    documentation: 'https://tether.to/en/how-it-works',
  },
} as const satisfies Record<string, Token>;
