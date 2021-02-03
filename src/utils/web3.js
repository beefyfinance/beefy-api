const Web3 = require('web3');
const { BSC_RPC } = require('../../constants');

const web3 = new Web3(BSC_RPC);

module.exports = web3;