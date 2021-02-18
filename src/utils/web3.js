const Web3 = require('web3');
const { BSC_RPC_ENDPOINTS, HECO_RPC, BSC_CHAIN_ID, HECO_CHAIN_ID } = require('../../constants');

const clients = { bsc: [], heco: [] };
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new Web3(endpoint));
});

clients.heco.push(new Web3(HECO_RPC));

const bscRandomClient = () => clients.bsc[~~(clients.bsc.length * Math.random())];
const hecoRandomClient = () => clients.heco[~~(clients.heco.length * Math.random())];

module.exports = {
  get bscWeb3() {
    return bscRandomClient();
  },

  get hecoWeb3() {
    return hecoRandomClient();
  },

  web3Factory: chainId => {
    switch (chainId) {
      case BSC_CHAIN_ID:
        return bscRandomClient();
      case HECO_CHAIN_ID:
        return hecoRandomClient();
    }
  },
};
