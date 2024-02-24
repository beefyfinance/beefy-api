import { beefyfinance } from './platforms/beefyfinance';
import { lynex } from './platforms/lynex';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _linea = {
  platforms: {
    lynex,
    beefyfinance,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const linea: ConstInterface<typeof _linea, Chain> = _linea;
