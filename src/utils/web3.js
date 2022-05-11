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
  get arbitrumWeb3() {
    return chainRandomClients.arbitrumRandomClient();
  },
  get celoWeb3() {
    return chainRandomClients.celoRandomClient();
  },
  get moonriverWeb3() {
    return chainRandomClients.moonriverRandomClient();
  },
  get cronosWeb3() {
    return chainRandomClients.cronosRandomClient();
  },
  get auroraWeb3() {
    return chainRandomClients.auroraRandomClient();
  },
  get fuseWeb3() {
    return chainRandomClients.fuseRandomClient();
  },
  get metisWeb3() {
    return chainRandomClients.metisRandomClient();
  },
  get moonbeamWeb3() {
    return chainRandomClients.moonbeamRandomClient();
  },
  get sysWeb3() {
    return chainRandomClients.sysRandomClient();
  },
  get emeraldWeb3() {
    return chainRandomClients.emeraldRandomClient();
  },

  web3Factory: _web3Factory,

  multicallAddress: _multicallAddress,
};
