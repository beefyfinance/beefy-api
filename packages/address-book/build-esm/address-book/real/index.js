import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap.js';
import * as platforms from './platforms/index.js';
import { tokens } from './tokens/tokens.js';
export const real = {
    platforms,
    tokens,
    tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
    native: {
        symbol: 'reETH',
        oracleId: 'reETH',
    },
};
