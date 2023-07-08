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

  ONE_CHAIN_ID,
  ONE_VAULTS_ENDPOINT,

  ARBITRUM_CHAIN_ID,
  ARBITRUM_VAULTS_ENDPOINT,

  CELO_CHAIN_ID,
  CELO_VAULTS_ENDPOINT,

  MOONRIVER_CHAIN_ID,
  MOONRIVER_VAULTS_ENDPOINT,

  CRONOS_CHAIN_ID,
  CRONOS_VAULTS_ENDPOINT,

  AURORA_CHAIN_ID,
  AURORA_VAULTS_ENDPOINT,

  FUSE_CHAIN_ID,
  FUSE_VAULTS_ENDPOINT,

  METIS_CHAIN_ID,
  METIS_VAULTS_ENDPOINT,

  MOONBEAM_CHAIN_ID,
  MOONBEAM_VAULTS_ENDPOINT,

  EMERALD_CHAIN_ID,
  EMERALD_VAULTS_ENDPOINT,

  OPTIMISM_CHAIN_ID,
  OPTIMISM_VAULTS_ENDPOINT,

  KAVA_CHAIN_ID,
  KAVA_VAULTS_ENDPOINT,

  CANTO_CHAIN_ID,
  CANTO_VAULTS_ENDPOINT,

  ZKSYNC_CHAIN_ID,
  ZKSYNC_VAULTS_ENDPOINT,

  ETH_CHAIN_ID,
  ETHEREUM_VAULTS_ENDPOINT,
} = require('../../constants');
const { getKey, setKey } = require('../../utils/cache');

const INIT_DELAY = 40 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

let tvl = {};

const chains = [
  {
    chainId: BSC_CHAIN_ID,
    vaultsEndpoint: BSC_VAULTS_ENDPOINT,
    governancePool: require('../../data/governancePool.json'),
  },
  {
    chainId: POLYGON_CHAIN_ID,
    vaultsEndpoint: POLYGON_VAULTS_ENDPOINT,
    governancePool: require('../../data/matic/governancePool.json'),
  },
  {
    chainId: FANTOM_CHAIN_ID,
    vaultsEndpoint: FANTOM_VAULTS_ENDPOINT,
    governancePool: require('../../data/fantom/governancePool.json'),
  },
  {
    chainId: HECO_CHAIN_ID,
    vaultsEndpoint: HECO_VAULTS_ENDPOINT,
    governancePool: require('../../data/heco/governancePool.json'),
  },
  {
    chainId: AVAX_CHAIN_ID,
    vaultsEndpoint: AVAX_VAULTS_ENDPOINT,
    governancePool: require('../../data/avax/governancePool.json'),
  },
  {
    chainId: ONE_CHAIN_ID,
    vaultsEndpoint: ONE_VAULTS_ENDPOINT,
    governancePool: require('../../data/one/governancePool.json'),
  },
  {
    chainId: ARBITRUM_CHAIN_ID,
    vaultsEndpoint: ARBITRUM_VAULTS_ENDPOINT,
    governancePool: require('../../data/arbitrum/governancePool.json'),
  },
  {
    chainId: CELO_CHAIN_ID,
    vaultsEndpoint: CELO_VAULTS_ENDPOINT,
    governancePool: require('../../data/celo/governancePool.json'),
  },
  {
    chainId: MOONRIVER_CHAIN_ID,
    vaultsEndpoint: MOONRIVER_VAULTS_ENDPOINT,
    governancePool: require('../../data/moonriver/governancePool.json'),
  },
  {
    chainId: CRONOS_CHAIN_ID,
    vaultsEndpoint: CRONOS_VAULTS_ENDPOINT,
    governancePool: require('../../data/cronos/governancePool.json'),
  },
  {
    chainId: AURORA_CHAIN_ID,
    vaultsEndpoint: AURORA_VAULTS_ENDPOINT,
    governancePool: require('../../data/aurora/governancePool.json'),
  },
  {
    chainId: FUSE_CHAIN_ID,
    vaultsEndpoint: FUSE_VAULTS_ENDPOINT,
    governancePool: require('../../data/fuse/governancePool.json'),
  },
  {
    chainId: METIS_CHAIN_ID,
    vaultsEndpoint: METIS_VAULTS_ENDPOINT,
    governancePool: require('../../data/metis/governancePool.json'),
  },
  {
    chainId: MOONBEAM_CHAIN_ID,
    vaultsEndpoint: MOONBEAM_VAULTS_ENDPOINT,
    governancePool: require('../../data/moonbeam/governancePool.json'),
  },
  {
    chainId: EMERALD_CHAIN_ID,
    vaultsEndpoint: EMERALD_VAULTS_ENDPOINT,
    // governancePool: require('../../data/moonbeam/governancePool.json'),
  },
  {
    chainId: OPTIMISM_CHAIN_ID,
    vaultsEndpoint: OPTIMISM_VAULTS_ENDPOINT,
    governancePool: require('../../data/optimism/governancePool.json'),
  },
  {
    chainId: KAVA_CHAIN_ID,
    vaultsEndpoint: KAVA_VAULTS_ENDPOINT,
    governancePool: require('../../data/kava/governancePool.json'),
  },
  {
    chainId: ETH_CHAIN_ID,
    vaultsEndpoint: ETHEREUM_VAULTS_ENDPOINT,
    governancePool: require('../../data/ethereum/governancePool.json'),
  },
  {
    chainId: CANTO_CHAIN_ID,
    vaultsEndpoint: CANTO_VAULTS_ENDPOINT,
    governancePool: require('../../data/canto/governancePool.json'),
  },
  {
    chainId: ZKSYNC_CHAIN_ID,
    vaultsEndpoint: ZKSYNC_VAULTS_ENDPOINT,
    // governancePool: require('../../data/zksync/governancePool.json'),
  },
];

const CACHE_KEY = 'TVL';

const getTvl = () => {
  return tvl;
};

const updateTvl = async () => {
  console.log('> updating tvl');
  const start = Date.now();

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

    console.log(`> updated tvl (${(Date.now() - start) / 1000}s)`);
    saveToRedis();
  } catch (err) {
    console.error('> tvl initialization failed', err);
  }

  setTimeout(updateTvl, REFRESH_INTERVAL);
};

const initTvlService = async () => {
  const cachedTvl = await getKey(CACHE_KEY);
  tvl = cachedTvl ?? {};

  setTimeout(updateTvl, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey(CACHE_KEY, tvl);
};

module.exports = { getTvl, initTvlService };
