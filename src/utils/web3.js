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
  get emeraldWeb3() {
    return chainRandomClients.emeraldRandomClient();
  },
  get optimismWeb3() {
    return chainRandomClients.optimismRandomClient();
  },
  get kavaWeb3() {
    return chainRandomClients.kavaRandomClient();
  },
  get ethereumWeb3() {
    return chainRandomClients.ethereumRandomClient();
  },
  get cantoWeb3() {
    return chainRandomClients.cantoRandomClient();
  },
  get zksyncWeb3() {
    return chainRandomClients.zksyncRandomClient();
  },
  get zkevmWeb3() {
    return chainRandomClients.zkevmRandomClient();
  },
  get baseWeb3() {
    return chainRandomClients.baseRandomClient();
  },
  get gnosisWeb3() {
    return chainRandomClients.gnosisRandomClient();
  },
  get lineaWeb3() {
    return chainRandomClients.lineaRandomClient();
  },
  get mantleWeb3() {
    return chainRandomClients.mantleRandomClient();
  },
  get fraxtalWeb3() {
    return chainRandomClients.fraxtalRandomClient();
  },
  get modeWeb3() {
    return chainRandomClients.modeRandomClient();
  },
  get mantaWeb3() {
    return chainRandomClients.mantaRandomClient();
  },
  get realWeb3() {
    return chainRandomClients.realRandomClient();
  },
  get seiWeb3() {
    return chainRandomClients.seiRandomClient();
  },
  get rootstockWeb3() {
    return chainRandomClients.rootstockRandomClient();
  },
  get scrollWeb3() {
    return chainRandomClients.scrollRandomClient();
  },
  get liskWeb3() {
    return chainRandomClients.liskRandomClient();
  },
  get sonicWeb3() {
    return chainRandomClients.sonicRandomClient();
  },
  get berachainWeb3() {
    return chainRandomClients.berachainRandomClient();
  },
  get unichainWeb3() {
    return chainRandomClients.unichainRandomClient();
  },

  web3Factory: _web3Factory,

  multicallAddress: _multicallAddress,
};
