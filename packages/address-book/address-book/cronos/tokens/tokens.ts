import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const CRO = {
  name: 'Wrapped CRO',
  address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
  symbol: 'WCRO',
  decimals: 18,
  chainId: 25,
  website: 'https://cronos.crypto.org/',
  description: 'Crypto.com Coin',
  logoURI: 'https://vvs.finance/images/tokens/0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23.svg',
} as const;

const _tokens = {
  CRO: CRO,
  WCRO: CRO,
  WNATIVE: CRO,
  VERSA: {
    name: 'VersaGames VERSA',
    symbol: 'VERSA',
    address: '0x00D7699b71290094CcB1a5884cD835bD65a78c17',
    chainId: 25,
    decimals: 18,
    logoURI: 'https://vvs.finance/images/tokens/0x00D7699b71290094CcB1a5884cD835bD65a78c17.svg',
    website: 'https://versagames.io/',
    description: 'VersaGames is the next-generation games marketplace.',
  },
  ALI: {
    name: 'Alethea Artificial Liquid Intelligence Token ALI',
    symbol: 'ALI',
    address: '0x45C135C1CDCE8d25A3B729A28659561385C52671',
    chainId: 25,
    decimals: 18,
    logoURI: 'https://vvs.finance/images/tokens/0x45C135C1CDCE8d25A3B729A28659561385C52671.svg',
    website: 'https://alethea.ai/',
    description:
      'Alethea AI is building a decentralized protocol to create an Intelligent Metaverse inhabited by interactive and intelligent NFTs (iNFTs).',
  },
  TUSD: {
    name: 'True USD',
    symbol: 'TUSD',
    address: '0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e',
    decimals: 18,
    chainId: 25,
    website: 'https://www.trueusd.com/',
    description:
      'TrueUSD is one of a number of cryptocurrency stablecoins administered by TrustToken, a platform for tokenizing real-world assets.',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2563.png',
  },
  SKY: {
    chainId: 25,
    address: '0x9D3BBb0e988D9Fb2d55d07Fe471Be2266AD9c81c',
    decimals: 18,
    name: 'SKY',
    symbol: 'SKY',
    website: 'https://www.darkcrypto.finance/',
    description: 'The first algorithmic token pegged to CRO running on the Cronos Chain',
    logoURI: 'https://assets.coingecko.com/coins/images/22517/small/logo-token-2.e9c15b63.png',
  },
  DARK: {
    chainId: 25,
    address: '0x83b2AC8642aE46FC2823Bc959fFEB3c1742c48B5',
    decimals: 18,
    name: 'DARK',
    symbol: 'DARK',
    website: 'https://www.darkcrypto.finance/',
    description: 'The first algorithmic token pegged to CRO running on the Cronos Chain',
    logoURI: 'https://assets.coingecko.com/coins/images/22456/small/DARK_bgWhite.png',
  },
  BIFI: {
    chainId: 25,
    address: '0xe6801928061CDbE32AC5AD0634427E140EFd05F9',
    decimals: 18,
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  TONIC: {
    name: 'Tectonic Governance Token',
    symbol: 'TONIC',
    address: '0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2',
    chainId: 25,
    decimals: 18,
    website: 'https://tectonic.finance/',
    description:
      'Tectonic is a cross-chain money market for earning passive yield and accessing instant backed loans',
    logoURI: 'https://vvs.finance/images/tokens/0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2.svg',
  },
  LIQ: {
    name: 'Liquidus',
    symbol: 'LIQ',
    address: '0xABd380327Fe66724FFDa91A87c772FB8D00bE488',
    chainId: 25,
    decimals: 18,
    website: 'https://farm.liquidus.finance/',
    description: 'Earn interest on your decentralised crypto assets',
    logoURI: 'https://farm.liquidus.finance/static/media/liquidus_logo_round.f72f345a.png',
  },
  ATOM: {
    name: 'Cosmos Token',
    symbol: 'ATOM',
    address: '0xB888d8Dd1733d72681b30c00ee76BDE93ae7aa93',
    chainId: 25,
    decimals: 6,
    website: 'https://cosmos.network/',
    description:
      'Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x0eb3a705fc54725037cc9e008bdede697f62f335.png',
  },
  DOGE: {
    name: 'Doge Token',
    symbol: 'DOGE',
    address: '0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396',
    chainId: 25,
    decimals: 8,
    logoURI: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=014',
    website: 'https://dogecoin.com/',
    description:
      'Dogecoin is an open source peer-to-peer digital currency, favored by Shiba Inus worldwide.',
  },
  SHIB: {
    name: 'Shiba Inu',
    symbol: 'SHIB',
    address: '0xbED48612BC69fA1CaB67052b42a95FB30C1bcFee',
    chainId: 25,
    decimals: 18,
    website: 'https://shibatoken.com/',
    description:
      'According to the SHIBA INU website, SHIB is the “DOGECOIN KILLER” and will be listed on their own ShibaSwap, a decentralized exchange.',
    logoURI: 'https://bscscan.com/token/images/shibatoken_32.png',
  },
  VVS: {
    name: 'VVSToken',
    symbol: 'VVS',
    address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03',
    chainId: 25,
    decimals: 18,
    logoURI: 'https://vvs.finance/images/tokens/0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03.svg',
    website: 'https://vvs.finance',
    description:
      'VVS is designed to be the simplest DeFi platform for users to swap tokens, earn high yields, and most importantly have fun!',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
    chainId: 25,
    decimals: 6,
    logoURI:
      'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Fusdc.png&w=48&q=50',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',
    chainId: 25,
    decimals: 18,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x062E66477Faf219F25D27dCED647BF57C3107d52',
    chainId: 25,
    decimals: 8,
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  CRONA: {
    name: 'CronaSwap Token',
    symbol: 'CRONA',
    address: '0xadbd1231fb360047525BEdF962581F3eee7b49fe',
    chainId: 25,
    decimals: 18,
    website: 'https://app.cronaswap.org/',
    description:
      'CronaSwap is the first decentralized exchange platform on the Cronos Chain and the lowest platform transaction fees (0.25%).',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0xadbd1231fb360047525BEdF962581F3eee7b49fe.svg',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x66e428c3f67a68878562e79A0234c1F83c208770',
    chainId: 25,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0x66e428c3f67a68878562e79A0234c1F83c208770.svg',
  },
  DAI: {
    name: 'DAI Token',
    symbol: 'DAI',
    address: '0xF2001B145b43032AAF5Ee2884e456CCd805F677D',
    chainId: 25,
    decimals: 18,
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0xF2001B145b43032AAF5Ee2884e456CCd805F677D.svg',
  },
  BUSD: {
    name: 'BUSD Token',
    symbol: 'BUSD',
    address: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    chainId: 25,
    decimals: 18,
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8.svg',
  },
  MATIC: {
    name: 'MATIC Token',
    symbol: 'MATIC',
    address: '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
    chainId: 25,
    decimals: 18,
    website: 'https://polygon.technology/',
    description:
      'The MATIC token serves dual purposes: securing the Polygon network via staking and being used for the payment of transaction fees.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055.svg',
  },
  AVAX: {
    name: 'Avalanche Token',
    symbol: 'AVAX',
    address: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    chainId: 25,
    decimals: 18,
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0x765277EebeCA2e31912C9946eAe1021199B39C61.svg',
  },
  FTM: {
    name: 'Fantom Token',
    symbol: 'FTM',
    address: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    chainId: 25,
    decimals: 18,
    website: 'https://fantom.foundation/',
    description:
      'Fantom is a fast, high-throughput open-source smart contract platform for digital assets and dApps.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0xB44a9B6905aF7c801311e8F4E76932ee959c663C.svg',
  },
  BNB: {
    name: 'Binance Token',
    symbol: 'BNB',
    address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    chainId: 25,
    decimals: 18,
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
    logoURI:
      'https://app.cronaswap.org/images/tokens/0xfA9343C3897324496A05fC75abeD6bAC29f8A40f.svg',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
