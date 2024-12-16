
import type { Token } from '../../../types/token.js';

const S = {
  name: 'Wrapped S',
  address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
  symbol: 'wS',
  oracleId: 'wS',
  decimals: 18,
  chainId: 146, 
  website: 'https://www.soniclabs.com/',
  description: 'Wrapped S, (S) Sonic is an EVM layer-1 platform that offers developers attractive incentives and powerful infrastructure.',
  bridge: 'canonical',
  logoURI: '',
  documentation: 'https://www.soniclabs.com/developer-resources',
} as const satisfies Token;

export const tokens = {
  S,
  WS: S,
  WNATIVE: S,
} as const satisfies Record<string, Token>;
