import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether ',
  address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 169,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
