"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressBookByChainId = exports.addressBook = exports.ChainId = void 0;
const chainid_js_1 = require("../types/chainid.js");
Object.defineProperty(exports, "ChainId", { enumerable: true, get: function () { return chainid_js_1.ChainId; } });
const index_js_1 = require("./polygon/index.js");
const index_js_2 = require("./bsc/index.js");
const index_js_3 = require("./avax/index.js");
const index_js_4 = require("./fantom/index.js");
const index_js_5 = require("./heco/index.js");
const index_js_6 = require("./one/index.js");
const index_js_7 = require("./arbitrum/index.js");
const index_js_8 = require("./celo/index.js");
const index_js_9 = require("./moonriver/index.js");
const index_js_10 = require("./cronos/index.js");
const index_js_11 = require("./aurora/index.js");
const index_js_12 = require("./fuse/index.js");
const index_js_13 = require("./metis/index.js");
const index_js_14 = require("./moonbeam/index.js");
const index_js_15 = require("./emerald/index.js");
const index_js_16 = require("./optimism/index.js");
const index_js_17 = require("./kava/index.js");
const index_js_18 = require("./ethereum/index.js");
const index_js_19 = require("./canto/index.js");
const index_js_20 = require("./zksync/index.js");
const index_js_21 = require("./zkevm/index.js");
const index_js_22 = require("./base/index.js");
const index_js_23 = require("./gnosis/index.js");
const index_js_24 = require("./linea/index.js");
const index_js_25 = require("./mantle/index.js");
const index_js_26 = require("./fraxtal/index.js");
const index_js_27 = require("./mode/index.js");
const index_js_28 = require("./manta/index.js");
const index_js_29 = require("./real/index.js");
const index_js_30 = require("./sei/index.js");
const index_js_31 = require("./rootstock/index.js");
const index_js_32 = require("./scroll/index.js");
const index_js_33 = require("./lisk/index.js");
const index_js_34 = require("./sonic/index.js");
const index_js_35 = require("./berachain/index.js");
const index_js_36 = require("./unichain/index.js");
const index_js_37 = require("./saga/index.js");
const index_js_38 = require("./hyperevm/index.js");
const index_js_39 = require("./plasma/index.js");
const index_js_40 = require("./monad/index.js");
const index_js_41 = require("./megaeth/index.js");
const index_js_42 = require("./robinhood/index.js");
exports.addressBook = {
    polygon: index_js_1.polygon,
    bsc: index_js_2.bsc,
    avax: index_js_3.avax,
    fantom: index_js_4.fantom,
    heco: index_js_5.heco,
    one: index_js_6.one,
    arbitrum: index_js_7.arbitrum,
    celo: index_js_8.celo,
    moonriver: index_js_9.moonriver,
    cronos: index_js_10.cronos,
    aurora: index_js_11.aurora,
    fuse: index_js_12.fuse,
    metis: index_js_13.metis,
    moonbeam: index_js_14.moonbeam,
    emerald: index_js_15.emerald,
    optimism: index_js_16.optimism,
    kava: index_js_17.kava,
    ethereum: index_js_18.ethereum,
    canto: index_js_19.canto,
    zksync: index_js_20.zksync,
    zkevm: index_js_21.zkevm,
    base: index_js_22.base,
    gnosis: index_js_23.gnosis,
    linea: index_js_24.linea,
    mantle: index_js_25.mantle,
    fraxtal: index_js_26.fraxtal,
    mode: index_js_27.mode,
    manta: index_js_28.manta,
    real: index_js_29.real,
    sei: index_js_30.sei,
    rootstock: index_js_31.rootstock,
    scroll: index_js_32.scroll,
    lisk: index_js_33.lisk,
    sonic: index_js_34.sonic,
    berachain: index_js_35.berachain,
    unichain: index_js_36.unichain,
    saga: index_js_37.saga,
    hyperevm: index_js_38.hyperevm,
    plasma: index_js_39.plasma,
    monad: index_js_40.monad,
    megaeth: index_js_41.megaeth,
    robinhood: index_js_42.robinhood,
};
exports.addressBookByChainId = {
    [chainid_js_1.ChainId.polygon]: index_js_1.polygon,
    [chainid_js_1.ChainId.bsc]: index_js_2.bsc,
    [chainid_js_1.ChainId.avax]: index_js_3.avax,
    [chainid_js_1.ChainId.fantom]: index_js_4.fantom,
    [chainid_js_1.ChainId.heco]: index_js_5.heco,
    [chainid_js_1.ChainId.one]: index_js_6.one,
    [chainid_js_1.ChainId.arbitrum]: index_js_7.arbitrum,
    [chainid_js_1.ChainId.celo]: index_js_8.celo,
    [chainid_js_1.ChainId.moonriver]: index_js_9.moonriver,
    [chainid_js_1.ChainId.cronos]: index_js_10.cronos,
    [chainid_js_1.ChainId.aurora]: index_js_11.aurora,
    [chainid_js_1.ChainId.fuse]: index_js_12.fuse,
    [chainid_js_1.ChainId.metis]: index_js_13.metis,
    [chainid_js_1.ChainId.moonbeam]: index_js_14.moonbeam,
    [chainid_js_1.ChainId.emerald]: index_js_15.emerald,
    [chainid_js_1.ChainId.optimism]: index_js_16.optimism,
    [chainid_js_1.ChainId.kava]: index_js_17.kava,
    [chainid_js_1.ChainId.ethereum]: index_js_18.ethereum,
    [chainid_js_1.ChainId.canto]: index_js_19.canto,
    [chainid_js_1.ChainId.zksync]: index_js_20.zksync,
    [chainid_js_1.ChainId.zkevm]: index_js_21.zkevm,
    [chainid_js_1.ChainId.base]: index_js_22.base,
    [chainid_js_1.ChainId.gnosis]: index_js_23.gnosis,
    [chainid_js_1.ChainId.linea]: index_js_24.linea,
    [chainid_js_1.ChainId.mantle]: index_js_25.mantle,
    [chainid_js_1.ChainId.fraxtal]: index_js_26.fraxtal,
    [chainid_js_1.ChainId.mode]: index_js_27.mode,
    [chainid_js_1.ChainId.manta]: index_js_28.manta,
    [chainid_js_1.ChainId.real]: index_js_29.real,
    [chainid_js_1.ChainId.sei]: index_js_30.sei,
    [chainid_js_1.ChainId.rootstock]: index_js_31.rootstock,
    [chainid_js_1.ChainId.scroll]: index_js_32.scroll,
    [chainid_js_1.ChainId.lisk]: index_js_33.lisk,
    [chainid_js_1.ChainId.sonic]: index_js_34.sonic,
    [chainid_js_1.ChainId.berachain]: index_js_35.berachain,
    [chainid_js_1.ChainId.unichain]: index_js_36.unichain,
    [chainid_js_1.ChainId.saga]: index_js_37.saga,
    [chainid_js_1.ChainId.hyperevm]: index_js_38.hyperevm,
    [chainid_js_1.ChainId.plasma]: index_js_39.plasma,
    [chainid_js_1.ChainId.monad]: index_js_40.monad,
    [chainid_js_1.ChainId.megaeth]: index_js_41.megaeth,
    [chainid_js_1.ChainId.robinhood]: index_js_42.robinhood,
};
