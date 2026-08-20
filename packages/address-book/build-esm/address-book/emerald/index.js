import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap.js';
import * as platforms from './platforms/index.js';
import { tokens } from './tokens/tokens.js';
export const emerald = {
    platforms,
    tokens,
    tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
    native: {
        symbol: 'ROSE',
        oracleId: 'ROSE',
    },
};
