import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 59144,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'linea-canonical',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WNATIVE: ETH,
  WETH: ETH,
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
