import { beefyfinance } from './platforms/beefyfinance';
import { velocimeter } from './platforms/velocimeter';
import { cvm } from './platforms/cvm';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _canto = {
  platforms: {
    beefyfinance,
    velocimeter,
    cvm,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const canto: ConstInterface<typeof _canto, Chain> = _canto;
