import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 1135,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0x05D032ac25d322df992303dCa074EE7392C117b9',
    chainId: 1135,
    decimals: 6,
    logoURI: '',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'canonical',
    documentation: 'https://tether.to/en/how-it-works',
  },
  LSK: {
    name: 'Lisk',
    symbol: 'LSK',
    oracleId: 'LSK',
    address: '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24',
    chainId: 1135,
    decimals: 18,
    logoURI: '',
    website: 'https://lisk.com/',
    description:
      'Lisk is supporting founders and builders from all around the world to thrive on Ethereum for the first time.',
    documentation: 'https://docs.lisk.com/',
    bridge: 'canonical',
  },
} as const satisfies Record<string, Token>;
