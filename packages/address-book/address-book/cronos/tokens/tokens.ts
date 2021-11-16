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
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
