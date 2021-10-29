const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');

const pools = require('../../../data/matic/cafeLpPools.json');

const getCafeLpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xca2DeAc853225f5a4dfC809Ae0B7c6e39104fCe5',
    tokenPerBlock: 'brewPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'pBREW',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.002,
    // log: true,
  });

module.exports = getCafeLpApys;
