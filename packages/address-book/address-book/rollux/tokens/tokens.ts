import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const SYS = {
  name: 'Wrapped Syscoin',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WSYS',
  decimals: 18,
  chainId: 570,
  website: 'https://syscoin.org/',
  description: 'Syscoin or SYS is the native currency built on the Syscoin blockchain.',
  bridge: 'syscoin-canonical',
  logoURI: 'https://syscoin.org/imgs/syscoin-logo.svg',
  documentation: 'https://docs.rollux.com/',
} as const;

const _tokens = {
  SYS,
  WNATIVE: SYS,
  WSYS: SYS,
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
