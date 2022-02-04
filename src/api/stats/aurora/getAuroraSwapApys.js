const { auroraWeb3: web3 } = require('../../../utils/web3');
const { AURORA_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/aurora/auroraSwapLpPools.json');

const getAuroraSwapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE',
    tokenPerBlock: 'BRLPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'BRL',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // log: true,
  });

module.exports = getAuroraSwapApys;
