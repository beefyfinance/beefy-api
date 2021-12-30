const { ethers } = require('ethers');
const getVaults = require('../../utils/getVaults.js');
const { getStrategiesSAFE } = require('../../utils/getStrategies.js');
const { getLastHarvestsSAFE } = require('../../utils/getLastHarvests.js');
const { ChainId } = require('../../../packages/address-book/address-book');
const { MULTICHAIN_ENDPOINTS, MULTICHAIN_RPC } = require('../../constants');

ethers.errors.setLogLevel('error');

const INIT_DELAY = 0 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let multichainVaults = [];
var multichainVaultsCounter = 0;
var multichainActiveVaultsCounter = 0;

const getMultichainVaults = () => {
  return multichainVaults;
};

const updateMultichainVaults = async () => {
  console.log('> updating vaults');

  // Reset entire list and counters
  multichainVaults = [];
  multichainVaultsCounter = 0;
  multichainActiveVaultsCounter = 0;

  try {
    for (let chain in MULTICHAIN_ENDPOINTS) {
      const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[ChainId[chain]]);

      let endpoint = MULTICHAIN_ENDPOINTS[chain];
      let chainVaults = await getVaults(endpoint);
      console.log('total of vaults ', chainVaults.length);
      chainVaults = await getStrategiesSAFE(chainVaults, provider);
      chainVaults = await getLastHarvestsSAFE(chainVaults, provider);

      var chainVaultsCounter = 0;
      var chainActiveVaultsCounter = 0;

      for (let vault in chainVaults) {
        chainVaults[vault].chain = chain;
        multichainVaults.push(chainVaults[vault]);

        chainVaultsCounter += 1;
        multichainVaultsCounter += 1;

        if (chainVaults[vault].status == 'active') {
          chainActiveVaultsCounter += 1;
          multichainActiveVaultsCounter += 1;
        }
      }

      console.log(
        'Found',
        chainVaultsCounter,
        'vaults (',
        chainActiveVaultsCounter,
        'active ) in',
        chain
      );
    }

    console.log(
      '> updated',
      multichainVaultsCounter,
      'vaults (',
      multichainActiveVaultsCounter,
      'active )'
    );
  } catch (err) {
    console.error('> vaults update failed', err);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
};

setTimeout(updateMultichainVaults, INIT_DELAY);

module.exports = getMultichainVaults;
