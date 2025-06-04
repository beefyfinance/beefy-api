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

  ZKEVM_CHAIN_ID,
  ZKEVM_VAULTS_ENDPOINT,

  ETH_CHAIN_ID,
  ETHEREUM_VAULTS_ENDPOINT,

  BASE_CHAIN_ID,
  BASE_VAULTS_ENDPOINT,

  GNOSIS_CHAIN_ID,
  GNOSIS_VAULTS_ENDPOINT,

  LINEA_CHAIN_ID,
  LINEA_VAULTS_ENDPOINT,

  MANTLE_CHAIN_ID,
  MANTLE_VAULTS_ENDPOINT,

  FRAXTAL_CHAIN_ID,
  FRAXTAL_VAULTS_ENDPOINT,

  MODE_CHAIN_ID,
  MODE_VAULTS_ENDPOINT,

  MANTA_CHAIN_ID,
  MANTA_VAULTS_ENDPOINT,

  REAL_CHAIN_ID,
  REAL_VAULTS_ENDPOINT,

  SEI_CHAIN_ID,
  SEI_VAULTS_ENDPOINT,

  ROOTSTOCK_CHAIN_ID,
  ROOTSTOCK_VAULTS_ENDPOINT,

  SCROLL_CHAIN_ID,
  SCROLL_VAULTS_ENDPOINT,

  LISK_CHAIN_ID,
  LISK_VAULTS_ENDPOINT,

  SONIC_CHAIN_ID,
  SONIC_VAULTS_ENDPOINT,

  BERACHAIN_CHAIN_ID,
  BERACHAIN_VAULTS_ENDPOINT,

  SAGA_CHAIN_ID,
  SAGA_VAULTS_ENDPOINT,

  HYPEREVM_CHAIN_ID,
  HYPEREVM_VAULTS_ENDPOINT,
} = require('../../constants');
const { getKey, setKey } = require('../../utils/cache');

const INIT_DELAY = Number(process.env.TVL_INIT_DELAY || 40 * 1000);
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
  {
    chainId: ONE_CHAIN_ID,
    vaultsEndpoint: ONE_VAULTS_ENDPOINT,
  },
  {
    chainId: ARBITRUM_CHAIN_ID,
    vaultsEndpoint: ARBITRUM_VAULTS_ENDPOINT,
  },
  {
    chainId: CELO_CHAIN_ID,
    vaultsEndpoint: CELO_VAULTS_ENDPOINT,
  },
  {
    chainId: MOONRIVER_CHAIN_ID,
    vaultsEndpoint: MOONRIVER_VAULTS_ENDPOINT,
  },
  {
    chainId: CRONOS_CHAIN_ID,
    vaultsEndpoint: CRONOS_VAULTS_ENDPOINT,
  },
  {
    chainId: AURORA_CHAIN_ID,
    vaultsEndpoint: AURORA_VAULTS_ENDPOINT,
  },
  {
    chainId: FUSE_CHAIN_ID,
    vaultsEndpoint: FUSE_VAULTS_ENDPOINT,
  },
  {
    chainId: METIS_CHAIN_ID,
    vaultsEndpoint: METIS_VAULTS_ENDPOINT,
  },
  {
    chainId: MOONBEAM_CHAIN_ID,
    vaultsEndpoint: MOONBEAM_VAULTS_ENDPOINT,
  },
  /*{
    chainId: EMERALD_CHAIN_ID,
    vaultsEndpoint: EMERALD_VAULTS_ENDPOINT,
  },*/
  {
    chainId: OPTIMISM_CHAIN_ID,
    vaultsEndpoint: OPTIMISM_VAULTS_ENDPOINT,
  },
  {
    chainId: KAVA_CHAIN_ID,
    vaultsEndpoint: KAVA_VAULTS_ENDPOINT,
  },
  {
    chainId: ETH_CHAIN_ID,
    vaultsEndpoint: ETHEREUM_VAULTS_ENDPOINT,
  },
  {
    chainId: CANTO_CHAIN_ID,
    vaultsEndpoint: CANTO_VAULTS_ENDPOINT,
  },
  {
    chainId: ZKSYNC_CHAIN_ID,
    vaultsEndpoint: ZKSYNC_VAULTS_ENDPOINT,
  },
  {
    chainId: ZKEVM_CHAIN_ID,
    vaultsEndpoint: ZKEVM_VAULTS_ENDPOINT,
  },
  {
    chainId: BASE_CHAIN_ID,
    vaultsEndpoint: BASE_VAULTS_ENDPOINT,
  },
  {
    chainId: GNOSIS_CHAIN_ID,
    vaultsEndpoint: GNOSIS_VAULTS_ENDPOINT,
  },
  {
    chainId: LINEA_CHAIN_ID,
    vaultsEndpoint: LINEA_VAULTS_ENDPOINT,
  },
  {
    chainId: MANTLE_CHAIN_ID,
    vaultsEndpoint: MANTLE_VAULTS_ENDPOINT,
  },
  {
    chainId: FRAXTAL_CHAIN_ID,
    vaultsEndpoint: FRAXTAL_VAULTS_ENDPOINT,
  },
  {
    chainId: MODE_CHAIN_ID,
    vaultsEndpoint: MODE_VAULTS_ENDPOINT,
  },
  {
    chainId: MANTA_CHAIN_ID,
    vaultsEndpoint: MANTA_VAULTS_ENDPOINT,
  },
  {
    chainId: REAL_CHAIN_ID,
    vaultsEndpoint: REAL_VAULTS_ENDPOINT,
  },
  {
    chainId: SEI_CHAIN_ID,
    vaultsEndpoint: SEI_VAULTS_ENDPOINT,
  },
  {
    chainId: ROOTSTOCK_CHAIN_ID,
    vaultsEndpoint: ROOTSTOCK_VAULTS_ENDPOINT,
  },
  {
    chainId: SCROLL_CHAIN_ID,
    vaultsEndpoint: SCROLL_VAULTS_ENDPOINT,
  },
  {
    chainId: LISK_CHAIN_ID,
    vaultsEndpoint: LISK_VAULTS_ENDPOINT,
  },
  {
    chainId: SONIC_CHAIN_ID,
    vaultsEndpoint: SONIC_VAULTS_ENDPOINT,
  },
  {
    chainId: BERACHAIN_CHAIN_ID,
    vaultsEndpoint: BERACHAIN_VAULTS_ENDPOINT,
  },
  {
    chainId: SAGA_CHAIN_ID,
    vaultsEndpoint: SAGA_VAULTS_ENDPOINT,
  },
  {
    chainId: HYPEREVM_CHAIN_ID,
    vaultsEndpoint: HYPEREVM_VAULTS_ENDPOINT,
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
