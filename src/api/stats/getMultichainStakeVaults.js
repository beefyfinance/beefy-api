const getStakeVaults = require('../../utils/getStakeVaults.js');

const { MULTICHAIN_STAKE_VAULTS_ENDPOINTS } = require('../../constants');

const INIT_DELAY = 0 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let multichainStakeVaults = [];
var multichainStakeVaultsCounter = 0;
var multichainActiveStakeVaultsCounter = 0;

const getMultichainStakeVaults = () => {
  return multichainStakeVaults;
};

const updateMultichainStakeVaults = async () => {
  console.log('> updating staked vaults');

  // Reset entire list and counters
  multichainStakeVaults = [];
  multichainStakeVaultsCounter = 0;
  multichainActiveStakeVaultsCounter = 0;

  try {
    for (let chain in MULTICHAIN_STAKE_VAULTS_ENDPOINTS) {
      let endpoint = MULTICHAIN_STAKE_VAULTS_ENDPOINTS[chain];
      let chainStakeVaults = await getStakeVaults(endpoint);

      var chainStakeVaultsCounter = 0;
      var chainActiveStakeVaultsCounter = 0;

      for (let vault in chainStakeVaults) {
        chainStakeVaults[vault].chain = chain;
        multichainStakeVaults.push(chainStakeVaults[vault]);

        chainStakeVaultsCounter += 1;
        multichainStakeVaultsCounter += 1;

        if (chainStakeVaults[vault].status == 'active') {
          chainActiveStakeVaultsCounter += 1;
          multichainActiveStakeVaultsCounter += 1;
        }
      }

      // console.log(
      //   'Found',
      //   chainVaultsCounter,
      //   'vaults (',
      //   chainActiveVaultsCounter,
      //   'active ) in',
      //   chain
      // );
    }

    console.log(
      '> updated',
      multichainStakeVaultsCounter,
      'stake vaults (',
      multichainActiveStakeVaultsCounter,
      'active )'
    );
  } catch (err) {
    console.error('> staked vaults update failed', err);
  }

  setTimeout(updateMultichainStakeVaults, REFRESH_INTERVAL);
};

setTimeout(updateMultichainStakeVaults, INIT_DELAY);

module.exports = getMultichainStakeVaults;
