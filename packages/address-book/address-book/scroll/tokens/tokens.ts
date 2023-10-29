import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x5300000000000000000000000000000000000004',
  symbol: 'WETH',
  decimals: 18,
  chainId: 534352,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'scroll-canonical',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WNATIVE: ETH,
  WETH: ETH,
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
