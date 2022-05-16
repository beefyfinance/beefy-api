import { beefyfinance } from './platforms/beefyfinance';
import { yuzu } from './platforms/yuzu';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _oasis = {
  platforms: {
    beefyfinance,
    yuzu,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const oasis: ConstInterface<typeof _oasis, Chain> = _oasis;
