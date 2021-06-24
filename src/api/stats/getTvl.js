const getChainTvl = require('./getChainTvl.js');

const {
  BSC_CHAIN_ID,
  BSC_VAULTS_ENDPOINT,

  HECO_CHAIN_ID,
  HECO_VAULTS_ENDPOINT,

  AVAX_CHAIN_ID,
  AVAX_VAULTS_ENDPOINT,

  POLYGON_CHAIN_ID,
  POLYGON_VAULTS_ENDPOINT,

  FANTOM_CHAIN_ID,
  FANTOM_VAULTS_ENDPOINT,
} = require('../../constants');

const INIT_DELAY = 40 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let tvl = {};

const chains = [
  {
    chainId: BSC_CHAIN_ID,
    vaultsEndpoint: BSC_VAULTS_ENDPOINT,
  },
  {
    chainId: POLYGON_CHAIN_ID,
    vaultsEndpoint: POLYGON_VAULTS_ENDPOINT,
  },
  {
    chainId: FANTOM_CHAIN_ID,
    vaultsEndpoint: FANTOM_VAULTS_ENDPOINT,
  },
  {
    chainId: HECO_CHAIN_ID,
    vaultsEndpoint: HECO_VAULTS_ENDPOINT,
  },
  {
    chainId: AVAX_CHAIN_ID,
    vaultsEndpoint: AVAX_VAULTS_ENDPOINT,
  },
];

const getTvl = () => {
  return tvl;
};

const updateTvl = async () => {
  console.log('> updating tvl');

  try {
    let promises = [];

    chains.forEach(chain => promises.push(getChainTvl(chain)));

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getChainTvl error', result.reason);
        continue;
      }
      tvl = { ...tvl, ...result.value };
    }

    console.log('> updated tvl');
  } catch (err) {
    console.error('> tvl initialization failed', err);
  }

  setTimeout(updateTvl, REFRESH_INTERVAL);
};

setTimeout(updateTvl, INIT_DELAY);

module.exports = getTvl;
