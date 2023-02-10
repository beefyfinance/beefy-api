import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const CANTO = {
  name: 'Wrapped Canto',
  address: '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
  symbol: 'WCANTO',
  decimals: 18,
  chainId: 7700,
  website: 'https://canto.io/',
  description:
    'Canto is a permissionless general-purpose blockchain running the Ethereum Virtual Machine (EVM). It was built to deliver on the promise of DeFi – that through a post-traditional financial movement, new systems will be made accessible, transparent, decentralized, and free.',
  logoURI: '',
  documentation: 'https://docs.canto.io/',
} as const;

const _tokens = {
  CANTO,
  WCANTO: CANTO,
  WNATIVE: CANTO,
  ATOM: {
    name: 'Cosmos Token',
    symbol: 'ATOM',
    address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
    chainId: 7700,
    decimals: 6,
    website: 'https://cosmos.network/',
    description:
      'Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
    logoURI: '',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  NOTE: {
    name: 'Note',
    symbol: 'NOTE',
    address: '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://canto.io/',
    documentation: 'https://docs.canto.io/overview/canto-unit-of-account-usdnote',
    description:
      '$NOTE is the unit of account on Canto. $NOTE is an over-collateralized currency with a value perpetually rebalanced toward $1 through an algorithmic interest rate policy. ',
  },
  USDC: {
    name: 'USD Coin',
    address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 7700,
    logoURI: '',
    documentation: 'https://developers.circle.com/docs',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
    chainId: 7700,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: '',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
