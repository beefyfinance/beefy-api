import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  symbol: 'WETH',
  decimals: 18,
  chainId: 1313161554,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
    chainId: 1313161554,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  NEAR: {
    name: 'NEAR',
    symbol: 'NEAR',
    address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d',
    chainId: 1313161554,
    decimals: 24,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d.svg',
    website: 'https://near.org/',
    description:
      'Through simple, secure, and scalable technology, NEAR empowers millions to invent and explore new experiences. Business, creativity, and community are being reimagined for a more sustainable and inclusive future.',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802',
    chainId: 1313161554,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xB12BFcA5A55806AaF64E99521918A4bf0fC40802.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f',
    chainId: 1313161554,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0xF4eB217Ba2454613b15dBdea6e5f22276410e89e',
    chainId: 1313161554,
    decimals: 8,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xF4eB217Ba2454613b15dBdea6e5f22276410e89e.svg',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  TRI: {
    name: 'Trisolaris',
    symbol: 'TRI',
    address: '0xFa94348467f64D5A457F75F8bc40495D33c65aBB',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xFa94348467f64D5A457F75F8bc40495D33c65aBB.svg',
    website: 'https://www.trisolaris.io/#/swap',
    description:
      'Trisolaris is #1 Dex on the Aurora engine, an EVM compatible blockchain running in the near ecosystem.',
  },
  AURORA: {
    name: 'Aurora',
    symbol: 'AURORA',
    address: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79.svg',
    website: 'https://www.aurorachain.io/',
    description:
      'Aurora is a decentralized application platform based on third-generation blockchain technology dedicated to providing mature blockchain technology solutions for the entire industry.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
