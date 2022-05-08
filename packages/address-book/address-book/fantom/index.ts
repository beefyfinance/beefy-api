import { beefyfinance } from './platforms/beefyfinance';
import { beethovenx } from './platforms/beethovenx';
import { spookyswap } from './platforms/spookyswap';
import { spiritswap } from './platforms/spiritswap';
import { sushiFtm } from './platforms/sushiFtm';
import { solidly } from './platforms/solidly';
import { tombswap } from './platforms/tombswap';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _fantom = {
  platforms: {
    beefyfinance,
    beethovenx,
    spookyswap,
    spiritswap,
    sushiFtm,
    solidly,
    tombswap,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
};
export const fantom: ConstInterface<typeof _fantom, Chain> = _fantom;
