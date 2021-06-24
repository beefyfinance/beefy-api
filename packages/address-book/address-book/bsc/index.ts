import { beefyfinance } from './platforms/beefyfinance';
import { pancake } from './platforms/pancake';
import { ironfinance } from './platforms/ironfinance';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';

const bsc = {
  platforms: {
    beefyfinance,
    pancake,
    ironfinance,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};

export { bsc };
