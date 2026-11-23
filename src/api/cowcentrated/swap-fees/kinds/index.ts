import type { Kind } from '../kind.ts';
import { algebraIntegral } from './algebra/integral.ts';
import { algebraV1 } from './algebra/v1.ts';
import { ramsesV2 } from './ramses/v2.ts';
import { ramsesV3 } from './ramses/v3.ts';
import { uniswapV3 } from './uniswap/v3.ts';
import { aero } from './velodrome/aero.ts';
import { slipstream } from './velodrome/slipstream.ts';

/** In priority order: a pool belongs to the first kind that matches it */
export const kinds: Kind[] = [aero, slipstream, algebraIntegral, algebraV1, ramsesV2, ramsesV3, uniswapV3];
