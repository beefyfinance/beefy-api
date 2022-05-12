import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const GLMR = {
  name: 'Moonbeam',
  address: '0xAcc15dC74880C9944775448304B263D191c6077F',
  symbol: 'WGLMR',
  decimals: 18,
  chainId: 1284,
  website: 'https://moonbeam.network/networks/moonbeam/',
  description:
    'A Polkadot Parachain Designed for Developers Moonbeam simplifies the developer experience by combining full Ethereum compatibility with the power of Polkadot, including scalability, cross-chain integrations, and on-chain governance.',
  logoURI: '',
} as const;

const _tokens = {
  GLMR,
  WGLMR: GLMR,
  WNATIVE: GLMR,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x595c8481c48894771CE8FaDE54ac6Bf59093F9E8',
    chainId: 1284,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  APE: {
    name: 'ApeCoin APE',
    symbol: 'APE',
    address: '0x3D632d9e1a60a0880Dd45E61f279D919b5748377',
    chainId: 1284,
    decimals: 18,
    logoURI: 'https://assets.spookyswap.finance/tokens/APE.png',
    website: 'http://apecoin.com/',
    description:
      'ApeCoin is for the Web3 Economy. Culture has found new expression in web3 through art, gaming, entertainment, and events.',
  },
  GLINT: {
    name: 'Beamswap Token',
    symbol: 'GLINT',
    address: '0xcd3B51D98478D53F4515A306bE565c6EebeF1D58',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xcd3B51D98478D53F4515A306bE565c6EebeF1D58.svg',
    website: 'https://beamswap.io/',
    description:
      'Beamswap is a decentralized exchange (DEX) with an automated market maker (AMM), providing liquidity and peer-to-peer transactions. But it aims to be so much more than that. Supporting an array of services and features, it will allow you to swap crypto assets, both fungible and non-fungible, earn passive income from staking and yield farming, and even launch your own crypto projects on Moonbeam.',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  USDCs: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  BUSD: {
    name: 'Binance-Peg BUSD Token',
    symbol: 'BUSD',
    address: '0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F.svg',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
  },
  BUSDc: {
    name: 'Binance-Peg BUSD Token (Celer)',
    symbol: 'BUSD',
    address: '0xCb4A7569a61300C50Cf80A2be16329AD9F5F8F9e',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F.svg',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
  },
  BNB: {
    name: 'Binance',
    symbol: 'BNB',
    address: '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055.svg',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  },
  BCMC: {
    name: 'Blockchain Monster Coin',
    symbol: 'BCMC',
    address: '0x8ECE0D14d619fE26e2C14C4a92c2F9E8634A039E',
    chainId: 1284,
    decimals: 18,
    logoURI: 'None',
    website: 'https://bcmhunt.com/',
    description:
      'Blockchain Monster Coin (BCMC) is the ultimate treasure facilitating all game activities that all BCMHunter seeks. This multichain token can be moved onto any chain with in-house bridging technology.',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xfA9343C3897324496A05fC75abeD6bAC29f8A40f.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  ETHs: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xfA9343C3897324496A05fC75abeD6bAC29f8A40f.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  USDTc: {
    name: 'Tether USD (Celer)',
    symbol: 'USDTc',
    address: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x765277EebeCA2e31912C9946eAe1021199B39C61.svg',
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
  },
  FTM: {
    name: 'Fantom',
    symbol: 'FTM',
    address: '0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327.svg',
    website: 'https://fantom.foundation/',
    description:
      'Fantom is a fast, high-throughput open-source smart contract platform for digital assets and dApps.',
  },
  axlATOM: {
    name: 'Axelar Wrapped ATOM',
    symbol: 'axlATOM',
    address: '0x27292cf0016E5dF1d8b37306B2A98588aCbD6fCA',
    chainId: 1284,
    decimals: 6,
    logoURI: 'None',
    website: 'https://cosmos.network/',
    description:
      "The ATOM is the Cosmos Hub's primary token and secures the Hub's valuable interchain services.",
  },
  axlUST: {
    name: 'Axelar Wrapped UST',
    symbol: 'axlUST',
    address: '0x085416975fe14C2A731a97eC38B9bF8135231F62',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x085416975fe14C2A731a97eC38B9bF8135231F62.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  MATIC: {
    name: 'Matic',
    symbol: 'MATIC',
    address: '0x3405A1bd46B85c5C029483FbECf2F3E611026e45',
    chainId: 1284,
    decimals: 18,
    logoURI: 'None',
    website: 'https://polygon.technology/',
    description:
      'Polygon believes in Web3 for all. Polygon is a decentralised Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees without ever sacrificing on security.',
  },
  AVAX: {
    name: 'Avalanche',
    symbol: 'AVAX',
    address: '0x4792C1EcB969B036eb51330c63bD27899A13D84e',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4792C1EcB969B036eb51330c63bD27899A13D84e.svg',
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
  },
  FLARE: {
    name: 'Flare Token',
    symbol: 'FLARE',
    address: '0xE3e43888fa7803cDC7BEA478aB327cF1A0dc11a7',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE3e43888fa7803cDC7BEA478aB327cF1A0dc11a7.svg',
    website: 'https://app.solarflare.io/exchange/swap',
    description:
      'Solarflare is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network. The goal is to provide a comprehensive and convenient, one-stop platform for the cryptocurrency community.',
  },
  STELLA: {
    name: 'Stella Token',
    symbol: 'STELLA',
    address: '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2.svg',
    website: 'https://app.stellaswap.com/exchange/swap',
    description:
      'Stellaswap is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network.',
  },
  xSTELLA: {
    name: 'xStella',
    symbol: 'xSTELLA',
    address: '0x06A3b410b681c82417A906993aCeFb91bAB6A080',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2.svg',
    website: 'https://app.stellaswap.com/exchange/swap',
    description:
      'Stellaswap is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network.',
  },
  xcDOT: {
    name: 'xcDOT',
    symbol: 'xcDOT',
    address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    chainId: 1284,
    decimals: 10,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080.svg',
    website: 'https://polkadot.network/',
    description:
      'Polkadot is an open-source sharding multichain protocol that facilitates the cross-chain transfer of any data or asset types, not just tokens, thereby making a wide range of blockchains interoperable with each other.',
  },
  veFLARE: {
    name: 'Vested Flare Token',
    symbol: 'veFLARE',
    address: '0x08c98AD2d4856BEC0a0EaF18C2a06E7201613F90',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x08c98AD2d4856BEC0a0EaF18C2a06E7201613F90.svg',
    website: 'https://app.solarflare.io/exchange/swap',
    description:
      'Solarflare is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network. The goal is to provide a comprehensive and convenient, one-stop platform for the cryptocurrency community.',
  },
  veSOLAR: {
    name: 'Vested SolarBeam Token',
    symbol: 'veSOLAR',
    address: '0x0DB6729C03C85B0708166cA92801BcB5CAc781fC',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x0DB6729C03C85B0708166cA92801BcB5CAc781fC.svg',
    website: 'https://app.solarbeam.io/exchange/swap',
    description:
      'Solarbeam is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonriver Network. We are currently the leading DEX on the network. The goal is to provide a comprehensive and convenient, one-stop platform for the cryptocurrency community.',
  },
  MOVR: {
    name: 'Moonriver',
    symbol: 'MOVR',
    address: '0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E.svg',
    website: 'https://moonbeam.network/networks/moonriver/',
    description:
      'Moonriver is a companion network to Moonbeam and provides a permanently incentivized canary network. New code ships to Moonriver first, where it can be tested and verified under real economic conditions. Once proven, the same code ships to Moonbeam on Polkadot.',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0',
    chainId: 1284,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0.svg',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  aWBTC: {
    name: 'Anyswap Wrapped BTC',
    symbol: 'WBTC',
    address: '0x922D641a426DcFFaeF11680e5358F34d97d112E1',
    chainId: 1284,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x922D641a426DcFFaeF11680e5358F34d97d112E1.svg',
    website: 'https://wbtc.network/',
    description:
      'Anyswap Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  LUNA: {
    name: 'Axelar Wrapped LUNA',
    symbol: 'LUNA',
    address: '0x31DAB3430f3081dfF3Ccd80F17AD98583437B213',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x31DAB3430f3081dfF3Ccd80F17AD98583437B213.svg',
    website: 'https://www.terra.money/',
    description:
      "Terra's native token, LUNA, is used to stabilize the price of the protocol's stablecoins. LUNA holders are also able to submit and vote on governance proposals, giving it the functionality of a governance token.",
  },
  UST: {
    name: 'Axelar Wrapped UST',
    symbol: 'UST',
    address: '0x085416975fe14C2A731a97eC38B9bF8135231F62',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x085416975fe14C2A731a97eC38B9bF8135231F62.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
