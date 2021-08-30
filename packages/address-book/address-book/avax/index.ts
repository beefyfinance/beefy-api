import { beefyfinance } from './platforms/beefyfinance';
import { lydia } from './platforms/lydia';
import { pangolin } from './platforms/pangolin';
import { joe } from './platforms/joe';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _avax = {
  platforms: {
    beefyfinance,
    lydia,
    pangolin,
    joe,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
export const avax: ConstInterface<typeof _avax, Chain> = _avax;
