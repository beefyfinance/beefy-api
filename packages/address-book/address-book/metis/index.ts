import { beefyfinance } from './platforms/beefyfinance';
import { netswap } from './platforms/netswap';
import { tethys } from './platforms/tethys';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _metis = {
  platforms: {
    beefyfinance,
    netswap,
    tethys,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const metis: ConstInterface<typeof _metis, Chain> = _metis;
