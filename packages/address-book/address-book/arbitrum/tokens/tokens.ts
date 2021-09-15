import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  symbol: 'WETH',
  decimals: 18,
  chainId: 42161,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x97513e975a7fA9072c72C92d8000B0dB90b163c5',
    chainId: 42161,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 42161,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  },
  SUSHI: {
    name: 'Sushi',
    address: '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
    symbol: 'SUSHI',
    decimals: 18,
    chainId: 42161,
    website: 'https://sushi.com/',
    description:
      'SushiSwap is an automated market-making (AMM) decentralized exchange (DEX) currently on the Ethereum blockchain.',
    logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
  },
  NYAN: {
    name: 'ArbiNYAN',
    address: '0xeD3fB761414DA74b74F33e5c5a1f78104b188DfC',
    symbol: 'NYAN',
    decimals: 18,
    chainId: 42161,
    website: 'https://arbinyan.com/',
    description:
      'ArbiNYAN is a fun cat token. The first fair launched token on Arbitrum with 95% of the supply distributed via farming rewards',
    logoURI: 'https://icons.llama.fi/arbinyan.jpg',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
