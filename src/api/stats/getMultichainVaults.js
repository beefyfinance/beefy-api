const getVaults = require('../../utils/getVaults.js');
const { getStrategies } = require('../../utils/getStrategies.js');
const { getLastHarvests } = require('../../utils/getLastHarvests.js');
const { fetchChainVaultsPpfs } = require('../../utils/fetchMooPrices');

const { MULTICHAIN_ENDPOINTS } = require('../../constants');
const { getKey, setKey } = require('../../utils/redisHelper.js');

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let vaultsByChain = {};
let multichainVaults = [];
var multichainVaultsCounter = 0;
var multichainActiveVaultsCounter = 0;

const getMultichainVaults = () => {
  return multichainVaults;
};

const getSingleChainVaults = chain => {
  return vaultsByChain[chain];
};

const updateMultichainVaults = async () => {
  console.log('> updating vaults');
  let start = Date.now();

  try {
    let promises = [];
    for (let chain in MULTICHAIN_ENDPOINTS) {
      promises.push(updateChainVaults(chain));
    }
    await Promise.all(promises);

    multichainVaults = Object.values(vaultsByChain).reduce(
      (accumulator, current) => [...accumulator, ...current],
      []
    );
    multichainVaultsCounter = multichainVaults.length;
    multichainActiveVaultsCounter = multichainVaults.filter(
      vault => vault.status === 'active'
    ).length;

    console.log(
      '> updated',
      multichainVaultsCounter,
      'vaults (',
      multichainActiveVaultsCounter,
      'active )',
      `(${(Date.now() - start) / 1000}s)`
    );
    saveToRedis();
  } catch (error) {
    console.error(`> vaults update failed `, err);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
};

const updateChainVaults = async chain => {
  try {
    let endpoint = MULTICHAIN_ENDPOINTS[chain];
    let chainVaults = await getVaults(endpoint);
    chainVaults.forEach(vault => (vault.chain = chain));
    chainVaults = await getStrategies(chainVaults, chain);
    chainVaults = await getLastHarvests(chainVaults, chain);
    await fetchChainVaultsPpfs(chainVaults, chain);
    vaultsByChain[chain] = chainVaults;
  } catch (error) {
    console.log(`> failed to update vaults on ${chain}`);
    console.log(error.message);
  }
};

export const initVaultService = async () => {
  const cachedVaults = await getKey('VAULTS_BY_CHAIN');

  vaultsByChain = cachedVaults ?? {};
  multichainVaults = Object.values(vaultsByChain).reduce(
    (accumulator, current) => [...accumulator, ...current],
    []
  );
  multichainVaultsCounter = multichainVaults.length;
  multichainActiveVaultsCounter = multichainVaults.filter(
    vault => vault.status === 'active'
  ).length;

  setTimeout(updateMultichainVaults, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('VAULTS_BY_CHAIN', vaultsByChain);
  console.log('> Vaults saved to redis');
};

module.exports = { getMultichainVaults, getSingleChainVaults, initVaultService };
