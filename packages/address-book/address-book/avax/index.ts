import { beefyfinance } from './platforms/beefyfinance';
import { lydia } from './platforms/lydia';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _avax = {
  platforms: {
    beefyfinance,
    lydia,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
export const avax: ConstInterface<typeof _avax, Chain> = _avax;
