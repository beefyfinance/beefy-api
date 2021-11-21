const { auroraWeb3: web3 } = require('../../../utils/web3');
const { AURORA_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/aurora/trisolarisLpPools.json');

const getTrisolarisApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x1f1Ed214bef5E83D8f5d0eB5D7011EB965D0D79B',
    tokenPerBlock: 'triPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'TRI',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // log: true,
  });

module.exports = getTrisolarisApys;
