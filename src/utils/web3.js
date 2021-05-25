const Web3 = require('web3');

const {
  BSC_RPC_ENDPOINTS,
  HECO_RPC,
  AVAX_RPC,
  POLYGON_RPC,
  FANTOM_RPC,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  AVAX_CHAIN_ID,
  POLYGON_CHAIN_ID,
  FANTOM_CHAIN_ID,
} = require('../constants');

const MULTICALLS = {
  56: '0xB94858b0bB5437498F5453A16039337e5Fdc269C',
  128: '0x2776CF9B6E2Fa7B33A37139C3CB1ee362Ff0356e',
  137: '0xC3821F0b56FA4F4794d5d760f94B812DE261361B',
  250: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  43114: '0x6FfF95AC47b586bDDEea244b3c2fe9c4B07b9F76',
};

const clients = { bsc: [], heco: [], avax: [], polygon: [], fantom: [] };
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new Web3(endpoint));
});
clients.heco.push(new Web3(HECO_RPC));
clients.avax.push(new Web3(AVAX_RPC));
clients.polygon.push(new Web3(POLYGON_RPC));
clients.fantom.push(new Web3(FANTOM_RPC));

const bscRandomClient = () => clients.bsc[~~(clients.bsc.length * Math.random())];
const hecoRandomClient = () => clients.heco[~~(clients.heco.length * Math.random())];
const avaxRandomClient = () => clients.avax[~~(clients.avax.length * Math.random())];
const polygonRandomClient = () => clients.polygon[~~(clients.polygon.length * Math.random())];
const fantomRandomClient = () => clients.fantom[~~(clients.fantom.length * Math.random())];

module.exports = {
  get bscWeb3() {
    return bscRandomClient();
  },

  get hecoWeb3() {
    return hecoRandomClient();
  },

  get avaxWeb3() {
    return avaxRandomClient();
  },

  get polygonWeb3() {
    return polygonRandomClient();
  },

  get fantomWeb3() {
    return fantomRandomClient();
  },

  web3Factory: chainId => {
    switch (chainId) {
      case BSC_CHAIN_ID:
        return bscRandomClient();
      case HECO_CHAIN_ID:
        return hecoRandomClient();
      case AVAX_CHAIN_ID:
        return avaxRandomClient();
      case POLYGON_CHAIN_ID:
        return polygonRandomClient();
      case FANTOM_CHAIN_ID:
        return fantomRandomClient();
    }
  },

  multicallAddress: chainId => MULTICALLS[chainId],
};
