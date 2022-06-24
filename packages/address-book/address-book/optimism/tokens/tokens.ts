import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  decimals: 18,
  chainId: 10,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: '',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BEETS: {
    name: 'Beethoven X Token',
    symbol: 'BEETS',
    address: '0x97513e975a7fA9072c72C92d8000B0dB90b163c5',
    chainId: 10,
    decimals: 18,
    website: 'https://beethovenx.io/',
    description:
      'BEETS is the governance token for the Beethoven X protocol. Built on Balancer V2, Beethoven X is the first next-generation AMM protocol on Fantom.',
    logoURI:
      'https://assets.coingecko.com/coins/images/19158/small/beets-icon-large.png?1634545465',
  },
  OP: {
    name: 'Optimism Token',
    symbol: 'OP',
    address: '0x4200000000000000000000000000000000000042',
    chainId: 10,
    decimals: 18,
    website: 'https://app.optimism.io/governance',
    description:
      'Optimistic Rollup is a layer 2 scaling solution that scales both transaction throughput and computation on Ethereum. The backbone of our implementation is the Optimistic Virtual Machine (OVM), which is fully compatible with the EVM.',
    logoURI: '',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    chainId: 10,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xef4229c8c3250C675F21BCefa42f58EfbfF6002a.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
