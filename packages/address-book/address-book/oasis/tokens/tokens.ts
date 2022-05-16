import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ROSE = {
  name: 'Wrapped ROSE ',
  address: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
  symbol: 'WROSE',
  decimals: 18,
  chainId: 42262,
  website: 'https://oasisprotocol.org/',
  description:
    'Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward',
  logoURI: '',
} as const;

const _tokens = {
  ROSE,
  WROSE: ROSE,
  WNATIVE: ROSE,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
    chainId: 42262,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  ceUSDC: {
    name: 'USD Coin (Celer)',
    symbol: 'ceUSDC',
    address: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    chainId: 42262,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  UST: {
    name: 'UST (Wormhole)',
    symbol: 'UST',
    address: '0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2',
    chainId: 42262,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  FTP: {
    name: 'Fountain Protocol',
    symbol: 'FTP',
    address: '0xd1dF9CE4b6159441D18BD6887dbd7320a8D52a05',
    chainId: 42262,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xd1dF9CE4b6159441D18BD6887dbd7320a8D52a05.svg',
    website: 'https://ftp.cash/home',
    description: 'Supply, borrow, and earn. More than a DeFi lending protocol.',
  },
  YUZU: {
    name: 'YUZUToken',
    symbol: 'YUZU',
    address: '0xf02b3e437304892105992512539F769423a515Cb',
    chainId: 42262,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xf02b3e437304892105992512539F769423a515Cb.svg',
    website: 'https://yuzu-swap.com/',
    description: 'An open, safe, fair DEX ecosystem with high composability built on Oasis',
  },
  USDT: {
    name: 'Tether USD (Wormhole)',
    symbol: 'USDT',
    address: '0xdC19A122e268128B5eE20366299fc7b5b199C8e3',
    chainId: 42262,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xdC19A122e268128B5eE20366299fc7b5b199C8e3.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  WETH: {
    name: 'Wrapped Ether (Wormhole)',
    symbol: 'WETH',
    address: '0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F',
    chainId: 42262,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
