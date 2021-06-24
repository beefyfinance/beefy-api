import { beefyfinance } from './platforms/beefyfinance';
import { lydia } from './platforms/lydia';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';

export const avax = {
  platforms: {
    beefyfinance,
    lydia,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
