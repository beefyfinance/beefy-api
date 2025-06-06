import type { Token } from '../../../types/token.js';

const GLMR = {
  name: 'Moonbeam',
  address: '0xAcc15dC74880C9944775448304B263D191c6077F',
  symbol: 'WGLMR',
  oracleId: 'WGLMR',
  decimals: 18,
  chainId: 1284,
  website: 'https://moonbeam.network/networks/moonbeam/',
  description:
    'A Polkadot Parachain Designed for Developers Moonbeam simplifies the developer experience by combining full Ethereum compatibility with the power of Polkadot, including scalability, cross-chain integrations, and on-chain governance.',
  bridge: 'native',
  logoURI: '',
  documentation: 'https://moonbeam.foundation/glimmer-token/',
} as const satisfies Token;

export const tokens = {
  WNATIVE: GLMR,
  FEES: GLMR,
  GLMR,
  WGLMR: GLMR,
  erc20GLMR: {
    ...GLMR,
    symbol: 'GLMR',
    // ERC20 interface to the native token (like METIS/CELO)
    address: '0x0000000000000000000000000000000000000802',
  },
  oldBIFI: {
    name: 'Beefy.Finance',
    symbol: 'oldBIFI',
    oracleId: 'oldBIFI',
    address: '0x595c8481c48894771CE8FaDE54ac6Bf59093F9E8',
    chainId: 1284,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
    documentation: 'https://docs.beefy.finance/',
  },
  STELLA4POOL: {
    name: 'Stellaswap 4Pool',
    symbol: 'stella4pool',
    oracleId: 'stellaswap-4pool',
    address: '0xB326b5189AA42Acaa3C649B120f084Ed8F4dCaA6',
    chainId: 1284,
    decimals: 18,
    website: 'https://app.stellaswap.com/exchange/pool/stable',
    description:
      'Stellaswap Base4Pool is a Stable Pool consisting of USDC.wh, USDt.xc, BUSD.wh, and FRAX tokens.',
    logoURI: '',
  },
  wstDOT: {
    name: 'Wrapped liquid staked DOT',
    symbol: 'wstDOT',
    oracleId: 'wstDOT',
    address: '0x191cf2602Ca2e534c5Ccae7BCBF4C46a704bb949',
    chainId: 1284,
    decimals: 10,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080.svg',
    website: 'https://polkadot.lido.fi/',
    description:
      'Lido for Polkadot is a liquid staking solution for DOT backed by industry-leading staking providers. wstDOT is wrapped version of stDOT',
    documentation: 'https://docs.polkadot.lido.fi/',
  },
  WBTCwh: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    oracleId: 'WBTCwh',
    address: '0xE57eBd2d67B462E9926e04a8e33f01cD0D64346D',
    chainId: 1284,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0.svg',
    website: 'https://www.portalbridge.com/#/transfer',
    description:
      'WBTCwh is a bridged version of WBTC from the Wormhole(Portal) portal. Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    documentation: 'https://docs.wormhole.com/wormhole/',
    bridge: 'wormhole',
  },
  WETHwh: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    oracleId: 'ETHwh',
    address: '0xab3f0245B83feB11d15AAffeFD7AD465a59817eD',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xfA9343C3897324496A05fC75abeD6bAC29f8A40f.svg',
    website: 'https://www.portalbridge.com/#/transfer',
    description:
      'WETHwh is a bridged version of native ETH from the Wormhole(Portal) portal. ETH is the native currency that flows within the Ethereum ecosystem.',
    documentation: 'https://docs.wormhole.com/wormhole/',
    bridge: 'wormhole',
  },
  USDCwh: {
    name: 'USD Coin',
    symbol: 'USDC.wh',
    oracleId: 'USDCwh',
    address: '0x931715FEE2d06333043d11F658C8CE934aC61D0c',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.portalbridge.com/#/transfer',
    description:
      'USDC bridged by Wormhole(Portal). USDC is a fully collateralized US dollar stablecoin. Native USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    documentation: 'https://docs.wormhole.com/wormhole/',
    bridge: 'wormhole',
  },
  POOP: {
    name: 'Raresama',
    symbol: 'POOP',
    oracleId: 'POOP',
    address: '0xFFfffFFecB45aFD30a637967995394Cc88C0c194',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://app.stellaswap.com/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fstellaswap%2Fassets%2Fmain%2Fbridge%2FPOOP.png&w=64&q=50',
    website: 'https://raresama.com/',
    description:
      'Raresama is an artist and community focused NFT marketplace with great ambitions to quickly become the leading marketplace on Moonbeam. POOP is the Raresama.com (NFT Marketplace) governance token.',
  },
  xcACA: {
    name: 'Acala xcACA',
    symbol: 'xcACA',
    oracleId: 'xcACA',
    address: '0xffffFFffa922Fef94566104a6e5A35a4fCDDAA9f',
    chainId: 1284,
    decimals: 12,
    logoURI: '',
    website: 'https://acala.network/',
    description: 'The decentralized Stablecoin of Polkadot',
  },
  xciBTC: {
    name: 'Interlay BTC',
    symbol: 'xciBTC',
    oracleId: 'xciBTC',
    address: '0xFFFFFfFf5AC1f9A51A93F5C527385edF7Fe98A52',
    chainId: 1284,
    decimals: 8,
    logoURI: '',
    website: 'https://interlay.io/',
    description:
      'Use your Bitcoin. Anywhere. Anytime. Interlay is a decentralized bridge that allows you to use your Bitcoin on Ethereum and Polkadot.',
  },
  xcINTR: {
    name: 'Interlay INTR',
    symbol: 'xcINTR',
    oracleId: 'xcINTR',
    address: '0xFffFFFFF4C1cbCd97597339702436d4F18a375Ab',
    chainId: 1284,
    decimals: 10,
    logoURI: '',
    website: 'https://interlay.io/',
    description:
      'Use your Bitcoin. Anywhere. Anytime. Interlay is a decentralized bridge that allows you to use your Bitcoin on Ethereum and Polkadot.',
  },
  WELL: {
    name: 'WELL',
    symbol: 'WELL',
    oracleId: 'WELL',
    address: '0x511aB53F793683763E5a8829738301368a2411E3',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x511aB53F793683763E5a8829738301368a2411E3.svg',
    website: 'https://moonwell.fi/',
    description: 'WELL is the native governance token of the Moonwell Artemis protocol',
    bridge: 'native',
    documentation: 'https://docs.moonwell.fi/moonwell/discover/about-moonwell',
  },
  MAI: {
    name: 'Mai Stablecoin',
    symbol: 'MAI',
    oracleId: 'gMAI',
    address: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xdFA46478F9e5EA86d57387849598dbFB2e964b02.svg',
    website: 'https://app.mai.finance/',
    description:
      "MAI is a stablecoin collateralized by your crypto assets. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
  },
  APE: {
    name: 'ApeCoin APE',
    symbol: 'APE',
    oracleId: 'APE',
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
    oracleId: 'GLINT',
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
    oracleId: 'USDC',
    address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  USDCs: {
    name: 'USD Coin',
    symbol: 'USDCs',
    oracleId: 'USDCs',
    address: '0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.nomad.xyz/',
    description:
      'bridged USDC by Nomad. USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  USDTs: {
    name: 'Tether USD',
    symbol: 'USDT',
    oracleId: 'USDTs',
    address: '0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594.svg',
    website: 'https://www.nomad.xyz/',
    description:
      'bridged USDT by Nomad. Tether converts cash into digital currency, to anchor or tether the value to the price of national currencies like the US dollar, the Euro, and the offshore Chinese yuan.',
  },
  DAIs: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    oracleId: 'DAIs',
    address: '0xc234A67a4F840E61adE794be47de455361b52413',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xc234A67a4F840E61adE794be47de455361b52413.svg',
    website: 'https://www.nomad.xyz/',
    description:
      'bridged DAI by Nomad. Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.',
  },
  FRAX: {
    name: 'Frax',
    symbol: 'FRAX',
    oracleId: 'FRAX',
    address: '0x322E86852e492a7Ee17f28a78c663da38FB33bfb',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x322E86852e492a7Ee17f28a78c663da38FB33bfb.svg',
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
    documentation: 'https://docs.frax.finance/',
  },
  BUSD: {
    name: 'Binance-Peg BUSD Token',
    symbol: 'BUSD',
    oracleId: 'BUSD',
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
    oracleId: 'BUSDc',
    address: '0xCb4A7569a61300C50Cf80A2be16329AD9F5F8F9e',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F.svg',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
  },
  BUSDwh: {
    name: 'Binance-Peg BUSD Token (Wormhole)',
    symbol: 'BUSD',
    oracleId: 'BUSDwh',
    address: '0x692C57641fc054c2Ad6551Ccc6566EbA599de1BA',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F.svg',
    website: 'https://www.binance.com/en/busd',
    description:
      'BUSD bridged by Wormhole(Portal). Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
    documentation: 'https://docs.wormhole.com/wormhole/',
  },
  BNB: {
    name: 'Binance',
    symbol: 'BNB',
    oracleId: 'BNB',
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
    oracleId: 'BCMC',
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
    oracleId: 'ETH',
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
    oracleId: 'ETHs',
    address: '0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xfA9343C3897324496A05fC75abeD6bAC29f8A40f.svg',
    website: 'https://www.nomad.xyz/',
    description:
      'Bridged ETH by Nomad. The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  USDTc: {
    name: 'Tether USD (Celer)',
    symbol: 'USDTc',
    oracleId: 'USDTc',
    address: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  xcUSDT: {
    name: 'Tether USD',
    symbol: 'xcUSDT',
    oracleId: 'USDT',
    address: '0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73.svg',
    website: 'https://tether.to/',
    description:
      'Bridged by XCM from Kusama. Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    documentation: 'https://moonbeam.network/news/polkadot-native-usdt-now-available-on-moonbeam',
    bridge: 'kusama',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    oracleId: 'DAI',
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
    oracleId: 'FTM',
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
    oracleId: 'axlATOM',
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
    oracleId: 'axlUST',
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
    oracleId: 'MATIC',
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
    oracleId: 'AVAX',
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
    oracleId: 'FLARE',
    address: '0xE3e43888fa7803cDC7BEA478aB327cF1A0dc11a7',
    chainId: 1284,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE3e43888fa7803cDC7BEA478aB327cF1A0dc11a7.svg',
    website: 'https://app.solarflare.io/exchange/swap',
    description:
      'Solarflare is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network. The goal is to provide a comprehensive and convenient, one-stop platform for the cryptocurrency community.',
    bridge: 'native',
    documentation: 'https://docs.solarflare.io/tokenomics',
  },
  STELLA: {
    name: 'Stella Token',
    symbol: 'STELLA',
    oracleId: 'STELLA',
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
    oracleId: 'xSTELLA',
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
    oracleId: 'xcDOT',
    address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    chainId: 1284,
    decimals: 10,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080.svg',
    website: 'https://polkadot.network/',
    description:
      'Polkadot is an open-source sharding multichain protocol that facilitates the cross-chain transfer of any data or asset types, not just tokens, thereby making a wide range of blockchains interoperable with each other.',
  },
  stDOTold: {
    name: 'Liquid staked DOT',
    symbol: 'stDOT',
    oracleId: 'stDOT',
    address: '0xFA36Fe1dA08C89eC72Ea1F0143a35bFd5DAea108',
    chainId: 1284,
    decimals: 10,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080.svg',
    website: 'https://polkadot.lido.fi/',
    description:
      'Lido for Polkadot is a liquid staking solution for DOT backed by industry-leading staking providers.',
  },
  stDOT: {
    name: 'Stella stDOT',
    symbol: 'stDOT',
    oracleId: 'stDOT',
    address: '0xbc7E02c4178a7dF7d3E564323a5c359dc96C4db4',
    chainId: 1284,
    decimals: 10,
    logoURI: '',
    website: 'https://app.stellaswap.com/stdot',
    description: 'Stake DOT.xc for stDOT',
    documentation: 'https://docs.stellaswap.com/',
    bridge: 'native',
  },
  veFLARE: {
    name: 'Vested Flare Token',
    symbol: 'veFLARE',
    oracleId: 'veFLARE',
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
    oracleId: 'veSOLAR',
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
    oracleId: 'MOVR',
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
    oracleId: 'WBTC',
    address: '0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0',
    chainId: 1284,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0.svg',
    website: 'https://www.nomad.xyz/',
    description:
      'WBTC bridged by Nomad. Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  aWBTC: {
    name: 'Anyswap Wrapped BTC',
    symbol: 'WBTC',
    oracleId: 'aWBTC',
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
    oracleId: 'LUNA',
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
    oracleId: 'axlUST',
    address: '0x085416975fe14C2A731a97eC38B9bF8135231F62',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x085416975fe14C2A731a97eC38B9bF8135231F62.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  xcaUSD: {
    name: 'xcaUSD',
    symbol: 'xcaUSD',
    oracleId: 'xcaUSD',
    address: '0xfFfFFFFF52C56A9257bB97f4B2b6F7B2D624ecda',
    chainId: 1284,
    decimals: 12,
    logoURI:
      'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/assets/chains/moonbeam/0xfFfFFFFF52C56A9257bB97f4B2b6F7B2D624ecda/logo.png',
    website: 'https://acala.network/ausd',
    description: 'Acala USD (aUSD). The native decentralized stablecoin of Polkadot.',
  },
  LDO: {
    name: 'Lido DAO',
    symbol: 'LDO',
    oracleId: 'LDO',
    address: '0x9Fda7cEeC4c18008096C2fE2B85F05dc300F94d0',
    chainId: 1284,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png?1609873644',
    website: 'https://stake.lido.fi/',
    documentation: 'https://docs.lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH 2.0 backed by industry-leading staking providers.',
  },
  stellaBase4pool: {
    name: 'stellaBase4pool',
    symbol: 'stellaswap-base4pool',
    oracleId: 'stellaswap-base4pool',
    address: '0xdA782836B65edC4E6811c7702C5E21786203Ba9d',
    chainId: 1284,
    decimals: 18,
    logoURI: '',
    website: 'https://stellaswap.com/',
    description:
      'Stellaswap is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonbeam Network. The 4pool is a stable-swap LP consisting of USDC, USDT, DAI & FRAX.',
    documentation:
      'https://docs.stellaswap.com/how-to-guides/swap-pool-and-farm/how-to-add-liquidity-in-stable-amm',
  },
  xcUSDC: {
    name: 'USD Coin',
    symbol: 'xcUSDC',
    oracleId: 'USDC',
    address: '0xFFfffffF7D2B0B761Af01Ca8e25242976ac0aD7D',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    bridge: 'kusama',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  axlUSDC: {
    name: 'USD Coin',
    symbol: 'axlUSDC',
    oracleId: 'USDC',
    address: '0xCa01a1D0993565291051daFF390892518ACfAD3A',
    chainId: 1284,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    bridge: 'axelar',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
} as const satisfies Record<string, Token>;
