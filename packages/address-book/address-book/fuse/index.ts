import { beefyfinance } from './platforms/beefyfinance';
import { voltage } from './platforms/voltage';
import { fuseNetwork } from './platforms/fuseNetwork';
import { sushiFuse } from './platforms/sushiFuse';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _fuse = {
  platforms: {
    beefyfinance,
    voltage,
    fuseNetwork,
    sushiFuse,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const fuse: ConstInterface<typeof _fuse, Chain> = _fuse;
