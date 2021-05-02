const Web3 = require('web3');
const { BSC_RPC_ENDPOINTS, HECO_RPC, AVAX_RPC, POLYGON_RPC, BSC_CHAIN_ID, HECO_CHAIN_ID, AVAX_CHAIN_ID, POLYGON_CHAIN_ID  } = require('../constants');

const clients = { bsc: [], heco: [], avax: [], polygon: [] };
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new Web3(endpoint));
});

clients.heco.push(new Web3(HECO_RPC));

clients.avax.push(new Web3(AVAX_RPC));

clients.polygon.push(new Web3(POLYGON_RPC));

const bscRandomClient = () => clients.bsc[~~(clients.bsc.length * Math.random())];
const hecoRandomClient = () => clients.heco[~~(clients.heco.length * Math.random())];
const avaxRandomClient = () => clients.avax[~~(clients.avax.length * Math.random())];
const polygonRandomClient = () => clients.polygon[~~(clients.polygon.length * Math.random())];

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
    }
  },
};
