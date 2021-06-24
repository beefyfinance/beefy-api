import { beefyfinance } from './platforms/beefyfinance';
import { spookyswap } from './platforms/spookyswap';
import { spiritswap } from './platforms/spiritswap';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';

export const fantom = {
  platforms: {
    beefyfinance,
    spookyswap,
    spiritswap,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
