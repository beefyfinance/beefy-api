"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = void 0;
const ETH = {
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    oracleId: 'WETH',
    decimals: 18,
    chainId: 130,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'canonical',
    documentation: 'https://ethereum.org/en/developers/docs/',
    tags: ['BLUECHIP'],
};
exports.tokens = {
    WNATIVE: ETH,
    FEES: ETH,
    ETH,
    WETH: ETH,
};
