import { beefyfinance } from './platforms/beefyfinance';
import { mdex } from './platforms/mdex';
import { tokens } from './tokens/tokens';

import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _heco = {
  platforms: {
    beefyfinance,
    mdex,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
export const heco: ConstInterface<typeof _heco, Chain> = _heco;
