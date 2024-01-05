import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const MNT = {
  name: 'Wrapped Mantle',
  address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
  symbol: 'WMNT',
  oracleId: 'WMNT',
  decimals: 18,
  chainId: 5000,
  website: 'https://www.mantle.xyz/',
  description:
    'With Mantle Network, an Ethereum rollup, Mantle Treasury and a token holder governed roadmap for products and initiatives.',
  bridge: 'native',
  logoURI: '',
  documentation: 'https://docs.mantle.xyz/governance/introduction/overview',
} as const;

const _tokens = {
  MNT,
  WMNT: MNT,
  WNATIVE: MNT,
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    oracleId: 'USDC',
    address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
    chainId: 5000,
    decimals: 6,
    logoURI: '',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'mantle-canonical',
  },
  MOE: {
    name: 'Moe Token',
    symbol: 'MOE',
    oracleId: 'MOE',
    address: '0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://merchantmoe.com/',
    documentation: 'https://docs.merchantmoe.com/merchant-moe/',
    description:
      'Merchant Moe is a traders oasis in the bustling world of Decentralized Finance (DeFi) on Mantle Network, offering a comprehensive and user-friendly Decentralized Exchange (DEX) experience.',
    bridge: 'native',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
