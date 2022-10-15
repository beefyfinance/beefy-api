import { beefyfinance } from './platforms/beefyfinance';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _kava = {
  platforms: {
    beefyfinance,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;
export const kava: ConstInterface<typeof _kava, Chain> = _kava;
