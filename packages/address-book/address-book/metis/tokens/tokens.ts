import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const METIS = {
  name: 'METIS',
  address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  symbol: 'WMETIS',
  oracleId: 'WMETIS',
  decimals: 18,
  chainId: 1088,
  website: 'https://www.metis.io/',
  description:
    'METIS IS SOLVING ETHEREUMS SIX BIGGEST CHALLENGES. SIMPLICITY. SPEED. STORAGE. SCALABILITY. SECURITY. SAVINGS.',
  bridge: 'native',
  logoURI: '',
} as const;

const _tokens = {
  METIS,
  WMETIS: METIS,
  WNATIVE: METIS,
  oldBIFI: {
    name: 'Beefy.Finance',
    symbol: 'oldBIFI',
    oracleId: 'oldBIFI',
    address: '0xe6801928061CDbE32AC5AD0634427E140EFd05F9',
    chainId: 1088,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
    documentation: 'https://docs.beefy.finance/',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    oracleId: 'WBTC',
    address: '0xa5B55ab1dAF0F8e1EFc0eB1931a957fd89B918f4',
    chainId: 1088,
    decimals: 8,
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI: 'https://ftmscan.com/token/images/wBTC_32.png',
  },
  NETT: {
    name: 'Netswap Token',
    symbol: 'NETT',
    oracleId: 'NETT',
    address: '0x90fE084F877C65e1b577c7b2eA64B8D8dd1AB278',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x90fE084F877C65e1b577c7b2eA64B8D8dd1AB278.svg',
    website: 'https://netswap.io/#/swap',
    description:
      'Netswap is a decentralized exchange (DEX) which runs on Metis Andromeda (Layer2), uses the same automated market-making (AMM) model as Uniswap, features a native governance token called NETT that is fully community distributed and is capable of trading all tokens issued on Ethereum and Metis Andromeda. In a crowded marketplace with multiple contenders, Netswap offers four critically important benefits: fast and cheap trades, built-in leverage swap function, community-driven development, and a fair and open token distribution.',
    bridge: 'native',
  },
  mUSDT: {
    name: 'USDT Token',
    symbol: 'm.USDT',
    oracleId: 'mUSDT',
    address: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
    chainId: 1088,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'metis-canonical',
  },
  mUSDC: {
    name: 'USDC Token',
    symbol: 'm.USDC',
    address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
    chainId: 1088,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xEA32A96608495e54156Ae48931A7c20f0dcc1a21.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'metis-canonical',
    oracleId: 'USDC',
  },
  mDAI: {
    name: 'Dai Stablecoin',
    symbol: 'm.DAI',
    oracleId: 'mDAI',
    address: '0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A.svg',
    website: 'https://makerdao.com/en/',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
  },
  WETH: {
    name: 'Ether',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0x420000000000000000000000000000000000000A',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x420000000000000000000000000000000000000A.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    bridge: 'metis-canonical',
  },
  BNB: {
    name: 'Poly-Peg BNB',
    symbol: 'BNB',
    oracleId: 'BNB',
    address: '0x2692BE44A6E38B698731fDDf417d060f0d20A0cB',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x2692BE44A6E38B698731fDDf417d060f0d20A0cB.svg',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  },
  TETHYS: {
    name: 'Tethys',
    symbol: 'TETHYS',
    oracleId: 'TETHYS',
    address: '0x69fdb77064ec5c84FA2F21072973eB28441F43F3',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x69fdb77064ec5c84FA2F21072973eB28441F43F3.svg',
    website:
      'https://tethys.finance/swap?inputCurrency=METIS&outputCurrency=0x69fdb77064ec5c84FA2F21072973eB28441F43F3',
    description:
      'We believe that in the future, L2 solutions will help Ethereum with scaling. Our mission is to empower the Metis Andromeda network with a fast, secure, reliable, and advanced native decentralized exchange app to handle all kinds of trading needs. Tethys was released on the 17th of December 2021 on Metis Andromeda network.',
  },
  BYTE: {
    name: 'BinaryDAO',
    symbol: 'BYTE',
    oracleId: 'BYTE',
    address: '0x721532bC0dA5ffaeB0a6A45fB24271E8098629A7',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x721532bC0dA5ffaeB0a6A45fB24271E8098629A7.svg',
    website: 'https://binarydao.finance/',
    description:
      'BinaryDAO is a yield DAO that uses its treasury to bootstrap and invest in early-staged crypto projects, enabling premium DeFi yield to BYTE token holders',
  },
  FTM: {
    name: 'Fantom Token',
    symbol: 'FTM',
    oracleId: 'FTM',
    address: '0xa9109271abcf0C4106Ab7366B4eDB34405947eED',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xa9109271abcf0C4106Ab7366B4eDB34405947eED.svg',
    website: 'https://fantom.foundation/',
    description:
      'Fantom is a fast, high-throughput open-source smart contract platform for digital assets and dApps.',
  },
  AVAX: {
    name: 'Avalanche Token',
    symbol: 'AVAX',
    oracleId: 'AVAX',
    address: '0xE253E0CeA0CDD43d9628567d097052B33F98D611',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE253E0CeA0CDD43d9628567d097052B33F98D611.svg',
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    oracleId: 'DAI',
    address: '0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A.svg',
    website: 'https://makerdao.com/en/',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
  },
  HUM: {
    name: 'Hummus',
    symbol: 'HUM',
    oracleId: 'HUM',
    address: '0x4aAC94985cD83be30164DfE7e9AF7C054D7d2121',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4aAC94985cD83be30164DfE7e9AF7C054D7d2121.svg',
    website: 'https://www.hummus.exchange/',
    description: 'Next Gen Decentralized AMM for Stableswaps',
    bridge: 'native',
  },
  MAIA: {
    name: 'Maia',
    symbol: 'MAIA',
    oracleId: 'MAIA',
    address: '0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD',
    chainId: 1088,
    decimals: 9,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/17181.png',
    website: 'https://app.maiadao.io/',
    description:
      'MAIA is the governance token of Maia DAO, the yield powerhouse of Metis which launched the Solidly-fork Hermes. With a 100% fair launch Maia DAO is a truly community owned.',
    bridge: 'native',
  },
  HERMES: {
    name: 'Hermes',
    symbol: 'HERMES',
    oracleId: 'HERMES',
    address: '0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8',
    chainId: 1088,
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21272.png',
    website: 'https://hermes.maiadao.io/',
    description:
      'HERMES is the governance token of the Solidly-fork Hermes Protocol on Metis. The token is emitted as a farming reward to liquidity providers and can be locked for a period to gain voting rights.',
    bridge: 'native',
  },
  'oldBIFI-METIS LP': {
    name: 'oldBIFI-METIS LP',
    symbol: 'oldBIFI-METIS LP',
    address: '0x89D433e8cCC871B3f12EA17b651ff3633DFb5DC0',
    chainId: 1088,
    decimals: 18,
    logoURI: '',
    website: 'https://app.beefy.com/',
    oracleId: 'netswap-bifi-metis',
    oracle: 'lps',
  },
  smUSDT: {
    name: 'Stargate Tether USD LP',
    symbol: 'smUSDT',
    oracleId: 'stargate-metis-usdt',
    address: '0x2b60473a7C41Deb80EDdaafD5560e963440eb632',
    chainId: 1088,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    documentation: 'https://stargateprotocol.gitbook.io/stargate/v/user-docs/',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
