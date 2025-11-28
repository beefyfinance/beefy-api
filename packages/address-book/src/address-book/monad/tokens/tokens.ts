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
  WETH: {
    name: 'Wrapped Ether',
    address: '0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242',
    symbol: 'WETH',
    oracleId: 'WETH',
    decimals: 18,
    chainId: 143,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'wormhole',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
  AUSD: {
    name: 'Agora Dollar',
    symbol: 'AUSD',
    oracleId: 'AUSD',
    address: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
    chainId: 143,
    decimals: 6,
    logoURI: '',
    website: 'https://agora.finance/',
    documentation: 'https://developer.agora.finance/',
    description:
      'AUSD is backed 100% by Agora’s Reserves. The Agora Reserve Fund is composed of cash, overnight repurchase and reverse repurchase agreements, and short-term U.S. Treasury securities.',
    bridge: 'native',
    risks: ['NO_TIMELOCK'],
  },
  USDT0: {
    name: 'USDT0',
    symbol: 'USDT0',
    oracleId: 'USDT0',
    address: '0xe7cd86e13AC4309349F30B3435a9d337750fC82D',
    chainId: 143,
    decimals: 6,
    logoURI: '',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'layer-zero',
    documentation: 'https://tether.to/en/how-it-works',
  },
} as const satisfies Record<string, Token>;
