import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap.js';
import * as platforms from './platforms/index.js';
import { tokens } from './tokens/tokens.js';
export const cronos = {
    platforms,
    tokens,
    tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
    native: {
        symbol: 'CRO',
        oracleId: 'CRO',
    },
};
