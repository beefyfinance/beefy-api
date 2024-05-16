import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 34443,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'mode-canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  MODE: {
    chainId: 34443,
    address: '0xDfc7C877a950e49D2610114102175A06C2e3167a',
    decimals: 18,
    name: 'Mode',
    symbol: 'MODE',
    oracleId: 'MODE',
    logoURI: '',
    website: 'https://www.mode.network/',
    documentation: 'https://docs.mode.network/',
    description: 'Mode is the Modular DeFi L2 building the Superchain alongside Optimism.',
    bridge: 'native',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xd988097fb8612cc24eeC14542bC03424c656005f',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'mode-canonical',
    chainId: 34443,
    logoURI: '',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xf0F161fDA2712DB8b566946122a5af183995e2eD',
    chainId: 34443,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'mode-canonical',
    logoURI: '',
    documentation: 'https://tether.to/en/how-it-works',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
