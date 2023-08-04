const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/base/baseSwapLpPools.json');

const getBaseSwapApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x2B0A43DCcBD7d42c18F6A83F86D1a19fA58d541A',
    tokenPerBlock: 'bswapPerSec',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BSWAP',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // log: true,
  });

module.exports = getBaseSwapApys;
