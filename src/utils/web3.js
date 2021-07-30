const { chainRandomClients, _web3Factory, _multicallAddress } = require('./web3Helpers');

// keep backwards compat for commonJs export system, but still get types in code by importing from web3Helpers.js

module.exports = {
  get bscWeb3() {
    return chainRandomClients.bscRandomClient();
  },

  get hecoWeb3() {
    return chainRandomClients.hecoRandomClient();
  },

  get avaxWeb3() {
    return chainRandomClients.avaxRandomClient();
  },

  get polygonWeb3() {
    return chainRandomClients.polygonRandomClient();
  },

  get fantomWeb3() {
    return chainRandomClients.fantomRandomClient();
  },

  get oneWeb3() {
    return chainRandomClients.oneRandomClient();
  },

  web3Factory: _web3Factory,

  multicallAddress: _multicallAddress,
};
