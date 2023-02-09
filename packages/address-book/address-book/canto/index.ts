import { beefyfinance } from './platforms/beefyfinance';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _canto = {
  platforms: {
    beefyfinance,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const canto: ConstInterface<typeof _canto, Chain> = _canto;
