import { getVaults } from '../../utils/getVaults';
import { getStrategies } from '../../utils/getStrategies';
import { getLastHarvests } from '../../utils/getLastHarvests';
import { fetchChainVaultsPpfs } from '../../utils/fetchMooPrices';
import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { getKey, setKey } from '../../utils/redisHelper.js';
import { allChainNames, ChainName } from '../../types/Chain';
import { VaultConfig, VaultConfigExtended, VaultWithChain } from '../../types/config-types';

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let vaultsByChain: { [chain in ChainName]?: VaultConfigExtended[] } = {};
let multichainVaults = [];
var multichainVaultsCounter = 0;
var multichainActiveVaultsCounter = 0;

const getMultichainVaults = () => {
  return multichainVaults;
};

const updateMultichainVaults = async () => {
  console.log('> updating vaults');
  let start = Date.now();

  try {
    let promises = [];
    for (const chain of allChainNames) {
      promises.push(updateChainVaults(chain));
    }
    await Promise.all(promises);

    multichainVaults = Object.values(vaultsByChain).reduce(
      (accumulator, current) => [...accumulator, ...current],
      [] as VaultConfigExtended[]
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
    console.error(`> vaults update failed `, error);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
};

const updateChainVaults = async (chain: ChainName) => {
  try {
    let endpoint = MULTICHAIN_ENDPOINTS[chain];
    const chainVaults: VaultWithChain[] = (await getVaults(endpoint)).map(vault => ({
      ...vault,
      chain,
    }));
    const stratVault = await getStrategies(chainVaults, chain);
    const harvestVaults = await getLastHarvests(stratVault, chain);
    const ppfsVaults = await fetchChainVaultsPpfs(harvestVaults, chain);
    vaultsByChain[chain] = ppfsVaults;
  } catch (error) {
    console.log(`> failed to update vaults on ${chain}`);
    console.log(error.message);
  }
};

const initVaultService = async () => {
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
  console.log('Vaults saved to redis');
};

export { getMultichainVaults, initVaultService };
