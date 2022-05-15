import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ONE = {
  name: 'Wrapped ONE',
  address: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
  symbol: 'WONE',
  decimals: 18,
  chainId: 1666600000,
  website: 'https://www.harmony.one/',
  description:
    'Harmony is an open and fast blockchain. Our mainnet runs Ethereum applications with 2-second transaction finality and 100 times lower fees.',
  logoURI:
    'https://res.cloudinary.com/dnz2bkszg/image/fetch/f_auto/https://raw.githubusercontent.com/sushiswap/icons/master/token/one.jpg',
} as const;

const SUSHI = {
  name: 'Sushi',
  address: '0xBEC775Cb42AbFa4288dE81F387a9b1A3c4Bc552A',
  symbol: 'SUSHI',
  decimals: 18,
  chainId: 1666600000,
  website: 'https://sushi.com/',
  description:
    'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
  logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
};

const _tokens = {
  ONE,
  WONE: ONE,
  WNATIVE: ONE,
  BIFI: {
    chainId: 1666600000,
    address: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    decimals: 18,
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  CRV: {
    chainId: 1666600000,
    address: '0x352cd428EFd6F31B5cae636928b7B84149cF369F',
    decimals: 18,
    name: 'Curve',
    symbol: 'CRV',
    website: 'https://curve.fi/',
    description:
      'Curve is an exchange liquidity pool on Ethereum. Curve is designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost.',
    logoURI: 'https://external-content.duckduckgo.com/ip3/resources.curve.fi.ico',
  },
  WBTC: {
    chainId: 1666600000,
    address: '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  ETH: {
    chainId: 1666600000,
    address: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15/logo.png',
  },
  USDC: {
    name: 'USD Coin',
    address: '0x985458E523dB3d53125813eD68c274899e9DfAb4',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 1666600000,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  },
  SUSHI,
  oneSUSHI: {
    ...SUSHI,
    symbol: 'oneSUSHI',
  },
  BUSD: {
    name: 'BUSD Token',
    symbol: 'BUSD',
    address: '0xE176EBE47d621b984a73036B9DA5d834411ef734',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
  },
  bscBUSD: {
    name: 'BUSD Token',
    symbol: 'BUSD',
    address: '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
  },
  YGG: {
    name: 'Yield Guild Games',
    symbol: 'YGG',
    address: '0x63cf309500d8be0B9fDB8F1fb66C821236c0438c',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://yieldguild.io/',
    description:
      'YGG IS A PLAY-TO-EARN GAMING GUILD, BRINGING PLAYERS TOGETHER TO EARN VIA BLOCKCHAIN-BASED ECONOMIES. WE ARE THE SETTLERS OF NEW WORLDS IN THE METAVERSE',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
  },
  AAVE: {
    name: 'Aave',
    symbol: 'AAVE',
    address: '0xcF323Aad9E522B93F11c352CaA519Ad0E14eB40F',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://aave.com/',
    description:
      'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
    logoURI: 'https://dex.apeswap.finance/images/coins/AAVE.svg',
  },
  AXS: {
    name: 'Axie Infinity',
    symbol: 'AXS',
    address: '0x14A7B318fED66FfDcc80C1517C172c13852865De',
    chainId: 1666600000,
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/axieinfinity_32.png',
    website: 'https://axieinfinity.com/',
    description:
      'Axie Infinity is a Pokémon-inspired digital pet universe built on the Ethereum blockchain where anyone can earn token rewards through skilled gameplay and contributions to the ecosystem.',
  },
  DAI: {
    name: 'DAI',
    symbol: 'DAI',
    address: '0xEf977d2f931C1978Db5F6747666fa1eACB0d0339',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3.png',
  },
  USDT: {
    name: 'USD Tether',
    symbol: 'USDT',
    address: '0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f',
    chainId: 1666600000,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x55d398326f99059ff775485246999027b3197955.png',
  },
  FRAX: {
    name: 'Frax Shares',
    symbol: 'FRAX',
    address: '0xeB6C08ccB4421b6088e581ce04fcFBed15893aC3',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
    logoURI: 'https://ftmscan.com/token/images/fraxfinance_32.png',
  },
  UST: {
    name: 'UST',
    symbol: 'UST',
    address: '0x224e64ec1BDce3870a6a6c777eDd450454068FEC',
    chainId: 1666600000,
    decimals: 18,
    website: 'https://mirror.finance/',
    description:
      'TerraUSD (UST) is the decentralized and algorithmic stablecoin of the Terra blockchain. It is a scalable, yield-bearing coin that is value-pegged to the US Dollar.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x23396cF899Ca06c4472205fC903bDB4de249D6fC.png',
  },
  BTC: {
    name: 'Harmony Bitcoin',
    symbol: '1BTC',
    address: '0xdc54046c0451f9269FEe1840aeC808D36015697d',
    chainId: 1666600000,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xdc54046c0451f9269FEe1840aeC808D36015697d.svg',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
