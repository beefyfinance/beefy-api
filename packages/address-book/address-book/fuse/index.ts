import { beefyfinance } from './platforms/beefyfinance';
import { fusefi } from './platforms/fusefi';
import { fuseNetwork } from './platforms/fuseNetwork';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _fuse = {
  platforms: {
    beefyfinance,
    fusefi,
    fuseNetwork,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const fuse: ConstInterface<typeof _fuse, Chain> = _fuse;
