const Web3 = require('web3');
const { BSC_RPC_ENDPOINTS } = require('../../constants');

const clients = []
BSC_RPC_ENDPOINTS.forEach((endpoint) => {
  clients.push(new Web3(endpoint));
});

module.exports = {
  get web3() {
    return clients[~~(clients.length * Math.random())]
  }
};