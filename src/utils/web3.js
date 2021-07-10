const { chainRandomClients, _web3Factory, _multicallAddress } = require('./web3Helpers');

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

  web3Factory: _web3Factory,

  multicallAddress: _multicallAddress,
};
