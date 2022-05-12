import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const SYS = {
  name: 'Wrapped SYS ',
  address: '0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB',
  symbol: 'WSYS',
  decimals: 18,
  chainId: 57,
  website: 'https://syscoin.org/',
  description:
    'Syscoin is a Proof-of-Work blockchain, merged-mined with Bitcoin. At its base it is a dual-layered blockchain: the core is the Syscoin blockchain itself, and running in tandem with it is an Ethereum Virtual Machine (EVM) layer called NEVM (Network-Enhanced Virtual Machine), which provides smart contract functionality.',
  logoURI: '',
} as const;

const _tokens = {
  SYS,
  WSYS: SYS,
  WNATIVE: SYS,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
    chainId: 57,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
    chainId: 57,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  WETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D',
    chainId: 57,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D.svg',
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
    chainId: 57,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055.svg',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x922D641a426DcFFaeF11680e5358F34d97d112E1',
    chainId: 57,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x922D641a426DcFFaeF11680e5358F34d97d112E1.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  PSYS: {
    name: 'Pegasys',
    symbol: 'PSYS',
    address: '0xE18c200A70908c89fFA18C628fE1B83aC0065EA4',
    chainId: 57,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE18c200A70908c89fFA18C628fE1B83aC0065EA4.svg',
    website: 'https://app.pegasys.finance/#/swap',
    description:
      'Pegasys is an automated liquidity protocol powered by a constant product formula and implemented in a system of non-upgradeable smart contracts on the Syscoin blockchain. It obviates the need for trusted intermediaries, prioritizing decentralization, censorship resistance, and security. Pegasys is open-source software licensed under the GPL.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
