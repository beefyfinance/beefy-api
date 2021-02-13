const Web3 = require('web3');
const { BSC_RPC_ENDPOINTS, HECO_RPC } = require('../../constants');

const clients = [];
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.push(new Web3(endpoint));
});

module.exports = {
  get bscWeb3() {
    return clients[~~(clients.length * Math.random())];
  },

  get hecoWeb3() {
    return new Web3(HECO_RPC);
  },
};
