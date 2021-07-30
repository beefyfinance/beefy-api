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

const _tokens = {
  WONE: ONE,
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
  SUSHI: {
    name: 'Sushi',
    address: '0xBEC775Cb42AbFa4288dE81F387a9b1A3c4Bc552A',
    symbol: 'SUSHI',
    decimals: 18,
    chainId: 1666600000,
    website: 'https://sushi.com/',
    description:
      'SushiSwap is an automated market-making (AMM) decentralized exchange (DEX) currently on the Ethereum blockchain.',
    logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
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
      'https://exchange.pancakeswap.finance/images/coins/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
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
      'https://exchange.pancakeswap.finance/images/coins/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
