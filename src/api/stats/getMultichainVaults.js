import BigNumber from 'bignumber.js';
import { isResultFulfilled, isResultRejected, withTimeout } from '../../utils/promise';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { keyBy, sumBy } from 'lodash';

const getVaults = require('../../utils/getVaults.js');
const { getStrategies } = require('../../utils/getStrategies');
const { getLastHarvests } = require('../../utils/getLastHarvests.js');
const { getGovVaultsTotalSupply } = require('../../utils/getGovVaultsTotalSupply');
const { fetchChainVaultsPpfs } = require('../../utils/fetchMooPrices');
const { MULTICHAIN_ENDPOINTS } = require('../../constants');
const { getKey, setKey } = require('../../utils/cache');

const INIT_DELAY = process.env.VAULTS_INIT_DELAY || 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const LOG_PER_CHAIN = false;

let vaultsByChain = {};
let multichainVaults = [];
let vaultsByID = {};
let govVaultsByChain = {};
let multichainGovVaults = [];
let govVaultsById = {};
let cowVaultsByChain = {};
let cowVaultsById = {};
let multichainCowVaults = [];

export function getMultichainVaults() {
  return multichainVaults;
}

export function getSingleChainVaults(chain) {
  return vaultsByChain[chain];
}

export function getVaultByID(vaultId) {
  return vaultsByID[vaultId];
}

export function getMultichainGovVaults() {
  return multichainGovVaults;
}

export function getSingleChainGovVaults(chain) {
  return govVaultsByChain[chain];
}

export function getGovVaultBtId(vaultId) {
  return govVaultsById[vaultId];
}

export function getMultichainCowVaults() {
  return multichainCowVaults;
}

export function getSingleChainCowVaults(chain) {
  return cowVaultsByChain[chain];
}

export function getCowVaultById(vaultId) {
  return cowVaultsById[vaultId];
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
      buildFromGovChains();
      buildFromCowChains();
      await saveToRedis();
    }

    const activeIdscounter = sumBy(
      multichainVaults.concat(multichainGovVaults).concat(multichainCowVaults),
      vault => (vault.status === 'active' ? 1 : 0)
    );

    console.log(
      `> Vaults for ${fulfilled.length}/${results.length} chains updated: ${
        multichainVaults.length + multichainGovVaults.length
      } vaults (${activeIdscounter} active) (${(Date.now() - start) / 1000}s)`
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
  vaultsByID = keyBy(multichainVaults, 'id');

  Object.keys(vaultsByChain).forEach(chain => serviceEventBus.emit(`vaults/${chain}/ready`));
  serviceEventBus.emit('vaults/updated');
}

function buildFromGovChains() {
  multichainGovVaults = Object.values(govVaultsByChain).flat();
  govVaultsById = keyBy(multichainGovVaults, 'id');

  Object.keys(multichainGovVaults).forEach(chain =>
    serviceEventBus.emit(`gov-vaults/${chain}/ready`)
  );
  serviceEventBus.emit('gov-vaults/updated');
}

function buildFromCowChains() {
  multichainCowVaults = Object.values(cowVaultsByChain).flat();
  cowVaultsById = keyBy(multichainCowVaults, 'id');

  Object.keys(multichainCowVaults).forEach(chain =>
    serviceEventBus.emit(`cow-vaults/${chain}/ready`)
  );
  serviceEventBus.emit('cow-vaults/updated');
}

async function updateChainVaults(chain) {
  if (LOG_PER_CHAIN) {
    console.log(`> updating vaults on ${chain}`);
  }

  const endpoint = MULTICHAIN_ENDPOINTS[chain];
  const vaults = await getVaults(endpoint);
  vaults.forEach(vault => (vault.chain = chain));

  let chainVaults = vaults.filter(vault => vault.type === 'standard');
  chainVaults = await getStrategies(chainVaults, chain);
  chainVaults = await getLastHarvests(chainVaults, chain);
  chainVaults = await fetchChainVaultsPpfs(chainVaults, chain);

  let govVaults = vaults.filter(vault => vault.type === 'gov');
  govVaults = await getGovVaultsTotalSupply(govVaults, chain);

  let cowVaults = vaults.filter(vault => vault.type === 'cowcentrated');
  cowVaults = await getStrategies(cowVaults, chain);
  cowVaults = await getLastHarvests(cowVaults, chain);

  // copy last harvests from CLMs to CLM Pools
  for (const cowVault of cowVaults) {
    const clmPools = govVaults.filter(v => v.tokenAddress === cowVault.earnedTokenAddress);
    for (const clmPool of clmPools) {
      clmPool.lastHarvest = cowVault.lastHarvest;
    }
  }

  vaultsByChain[chain] = chainVaults;
  govVaultsByChain[chain] = govVaults;
  cowVaultsByChain[chain] = cowVaults;

  if (LOG_PER_CHAIN) {
    console.log(`> updated vaults on ${chain} - ${chainVaults.length}`);
  }
}

async function loadFromRedis() {
  const cachedVaults = await getKey('VAULTS_BY_CHAIN');
  const cachedGovVaults = await getKey('GOV_VAULTS_BY_CHAIN');
  const cachedCowVaults = await getKey('COW_VAULTS_BY_CHAIN');

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

  if (cachedGovVaults && typeof cachedGovVaults === 'object') {
    let cachedCount = 0;

    Object.values(cachedVaults).forEach(vaults => {
      vaults.forEach(vault => {
        ++cachedCount;
        if (vault.totalSupply) {
          vault.totalSupply = new BigNumber(vault.totalSupply);
        }
      });
    });

    if (cachedCount > 0) {
      govVaultsByChain = cachedGovVaults;
      buildFromGovChains();
    }
  }

  if (cachedCowVaults && typeof cachedCowVaults === 'object') {
    let cachedCount = 0;

    Object.values(cachedCowVaults).forEach(vaults => {
      vaults.forEach(vault => {
        ++cachedCount;
      });
    });

    if (cachedCount > 0) {
      cowVaultsByChain = cachedCowVaults;
      buildFromCowChains();
    }
  }
}

async function saveToRedis() {
  await setKey('VAULTS_BY_CHAIN', vaultsByChain);
  await setKey('GOV_VAULTS_BY_CHAIN', govVaultsByChain);
  await setKey('COW_VAULTS_BY_CHAIN', cowVaultsByChain);
}

export async function initVaultService() {
  await loadFromRedis();
  setTimeout(updateMultichainVaults, INIT_DELAY);
}
