"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hyperevm = void 0;
const convertSymbolTokenMapToAddressTokenMap_js_1 = require("../../util/convertSymbolTokenMapToAddressTokenMap.js");
const platforms = require("./platforms/index.js");
const tokens_js_1 = require("./tokens/tokens.js");
exports.hyperevm = {
    platforms,
    tokens: tokens_js_1.tokens,
    tokenAddressMap: (0, convertSymbolTokenMapToAddressTokenMap_js_1.convertSymbolTokenMapToAddressTokenMap)(tokens_js_1.tokens),
    native: {
        symbol: 'HYPE',
        oracleId: 'HYPE',
    },
};
