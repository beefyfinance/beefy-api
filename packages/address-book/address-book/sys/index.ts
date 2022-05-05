import { beefyfinance } from './platforms/beefyfinance';
import { pegasys } from './platforms/pegasys';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _sys = {
  platforms: {
    beefyfinance,
    pegasys,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const sys: ConstInterface<typeof _sys, Chain> = _sys;
