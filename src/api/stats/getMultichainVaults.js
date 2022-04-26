const getVaults = require('../../utils/getVaults.js');
const { getStrategies } = require('../../utils/getStrategies.js');
const { getLastHarvests } = require('../../utils/getLastHarvests.js');

const { MULTICHAIN_ENDPOINTS } = require('../../constants');
const { getKey, setKey } = require('../../utils/redisHelper.js');

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let multichainVaults = [];
var multichainVaultsCounter = 0;
var multichainActiveVaultsCounter = 0;

const getMultichainVaults = () => {
  return multichainVaults;
};

const updateMultichainVaults = async () => {
  console.log('> updating vaults');
  let start = Date.now();

  // Reset entire list and counters
  multichainVaults = [];
  multichainVaultsCounter = 0;
  multichainActiveVaultsCounter = 0;

  try {
    for (let chain in MULTICHAIN_ENDPOINTS) {
      let endpoint = MULTICHAIN_ENDPOINTS[chain];
      let chainVaults = await getVaults(endpoint);
      chainVaults = await getStrategies(chainVaults, chain);
      chainVaults = await getLastHarvests(chainVaults, chain);

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
      multichainVaultsCounter,
      'vaults (',
      multichainActiveVaultsCounter,
      'active )',
      `(${(Date.now() - start) / 1000}s)`
    );
    saveToRedis();
  } catch (err) {
    console.error(`> vaults update failed `, err);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
};

export const initVaultService = async () => {
  const cachedVaults = await getKey('VAULTS');
  const cachedActiveVaultCount = await getKey('ACTIVE_VAULT_COUNT');
  const cachedVaultCount = await getKey('VAULT_COUNT');

  multichainVaults = cachedVaults ?? [];
  multichainActiveVaultsCounter = cachedActiveVaultCount ?? 0;
  multichainVaultsCounter = cachedVaultCount ?? 0;

  setTimeout(updateMultichainVaults, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('VAULTS', multichainVaults);
  await setKey('ACTIVE_VAULT_COUNT', multichainActiveVaultsCounter);
  await setKey('VAULT_COUNT', multichainVaultsCounter);
  console.log('Vaults saved to redis');
};

module.exports = { getMultichainVaults, initVaultService };
