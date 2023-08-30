import { beefyfinance } from './platforms/beefyfinance';
import { balancer } from './platforms/balancer';
import { baseSwap } from './platforms/baseSwap';
import { bvm } from './platforms/bvm';
import { aerodrome } from './platforms/aerodrome';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _base = {
  platforms: {
    beefyfinance,
    balancer,
    baseSwap,
    bvm,
    aerodrome,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const base: ConstInterface<typeof _base, Chain> = _base;
