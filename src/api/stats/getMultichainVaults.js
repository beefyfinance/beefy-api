import BigNumber from 'bignumber.js';
import { isResultFulfilled, isResultRejected, withTimeout } from '../../utils/promise';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { keyBy, sumBy } from 'lodash';

const getVaults = require('../../utils/getVaults.js');
const { getStrategies } = require('../../utils/getStrategies.js');
const { getLastHarvests } = require('../../utils/getLastHarvests.js');
const { fetchChainVaultsPpfs } = require('../../utils/fetchMooPrices');
const { MULTICHAIN_ENDPOINTS } = require('../../constants');
const { getKey, setKey } = require('../../utils/cache');

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const LOG_PER_CHAIN = false;

let vaultsByChain = {};
let multichainVaults = [];
let multichainVaultsCounter = 0;
let multichainActiveVaultsCounter = 0;
let vaultsByID = {};

export function getMultichainVaults() {
  return multichainVaults;
}

export function getSingleChainVaults(chain) {
  return vaultsByChain[chain];
}

export function getVaultByID(vaultId) {
  return vaultsByID[vaultId];
}

async function updateMultichainVaults() {
  console.log('> updating vaults');

  try {
    const start = Date.now();
    const timeout = Math.floor(REFRESH_INTERVAL / 2);
    const results = await Promise.allSettled(
      Object.keys(MULTICHAIN_ENDPOINTS).map(chain => withTimeout(updateChainVaults(chain), timeout))
    );
    const fulfilled = results.filter(isResultFulfilled);

    if (fulfilled.length) {
      // TODO: add TTL so entries are removed if not updated (e.g. chain rpc is down)
      buildFromChains();
      await saveToRedis();
    }

    console.log(
      `> Vaults for ${fulfilled.length}/${
        results.length
      } chains updated: ${multichainVaultsCounter} vaults (${multichainActiveVaultsCounter} active) (${
        (Date.now() - start) / 1000
      }s)`
    );

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isResultRejected);
      console.error(` - ${rejected.length} chains failed to update:`);
      rejected.forEach(result => console.error(`  - ${result.reason}`));
    }
  } catch (err) {
    console.error(`> vaults update failed `, err);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
}

function buildFromChains() {
  multichainVaults = Object.values(vaultsByChain).flat();
  multichainVaultsCounter = multichainVaults.length;
  multichainActiveVaultsCounter = sumBy(multichainVaults, vault =>
    vault.status === 'active' ? 1 : 0
  );
  vaultsByID = keyBy(multichainVaults, 'id');

  Object.keys(vaultsByChain).forEach(chain => serviceEventBus.emit(`vaults/${chain}/ready`));
  serviceEventBus.emit('vaults/updated');
}

async function updateChainVaults(chain) {
  if (LOG_PER_CHAIN) {
    console.log(`> updating vaults on ${chain}`);
  }

  const endpoint = MULTICHAIN_ENDPOINTS[chain];
  let chainVaults = await getVaults(endpoint);
  chainVaults.forEach(vault => (vault.chain = chain));
  chainVaults = await getStrategies(chainVaults, chain);
  chainVaults = await getLastHarvests(chainVaults, chain);
  await fetchChainVaultsPpfs(chainVaults, chain);
  vaultsByChain[chain] = chainVaults;

  if (LOG_PER_CHAIN) {
    console.log(`> updated vaults on ${chain} - ${chainVaults.length}`);
  }
}

async function loadFromRedis() {
  const cachedVaults = await getKey('VAULTS_BY_CHAIN');

  if (cachedVaults && typeof cachedVaults === 'object') {
    let cachedCount = 0;

    Object.values(cachedVaults).forEach(vaults => {
      vaults.forEach(vault => {
        ++cachedCount;
        if (vault.pricePerFullShare) {
          vault.pricePerFullShare = new BigNumber(vault.pricePerFullShare);
        }
      });
    });

    if (cachedCount > 0) {
      vaultsByChain = cachedVaults;
      buildFromChains();
    }
  }
}

async function saveToRedis() {
  await setKey('VAULTS_BY_CHAIN', vaultsByChain);
}

export async function initVaultService() {
  await loadFromRedis();
  setTimeout(updateMultichainVaults, INIT_DELAY);
}
