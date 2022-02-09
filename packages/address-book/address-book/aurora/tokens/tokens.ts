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
    address: '0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0',
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
  atUST: {
    name: 'UST Terra',
    symbol: 'UST',
    address: '0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  atLUNA: {
    name: 'Luna Terra',
    symbol: 'LUNA',
    address: '0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096.svg',
    website: 'https://www.terra.money/',
    description:
      "Terra's native token, LUNA, is used to stabilize the price of the protocol's stablecoins. LUNA holders are also able to submit and vote on governance proposals, giving it the functionality of a governance token.",
  },
  AVAX: {
    name: 'Avalanche',
    symbol: 'AVAX',
    address: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844.svg',
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
  },
  BNB: {
    name: 'Binance',
    symbol: 'BNB',
    address: '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c.svg',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  },
  MATIC: {
    name: 'Matic',
    symbol: 'MATIC',
    address: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8.svg',
    website: 'https://polygon.technology/',
    description:
      'The MATIC token serves dual purposes: securing the Polygon network via staking and being used for the payment of transaction fees.',
  },
  FLX: {
    name: 'Flux Token',
    symbol: 'FLX',
    address: '0xea62791aa682d455614eaA2A12Ba3d9A2fD197af',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xea62791aa682d455614eaA2A12Ba3d9A2fD197af.svg',
    website: 'https://www.fluxprotocol.org/',
    description:
      'Flux is the trustless data layer for web3. Flux is a cross-chain oracle that provides smart contracts with access to economically secure data feeds on anything.',
  },
  MECHA: {
    name: 'Mecha',
    symbol: 'MECHA',
    address: '0xa33C3B53694419824722C10D99ad7cB16Ea62754',
    chainId: 1313161554,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa33C3B53694419824722C10D99ad7cB16Ea62754.svg',
    website: 'https://www.mechatracker.finance/#/',
    description:
      'Our mission is making Aurora easier, thus making it bigger. Track your assets and DeFi portfolio with #MechaDashboards, easily swap tokens on a tap, visualize your NFTs and unleash the platform full power through the MECHA token.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
