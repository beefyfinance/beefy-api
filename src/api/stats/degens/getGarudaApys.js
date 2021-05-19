const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/GarudaMasterChef.json');
const pools = require('../../../data/degens/garudaLpPools.json');

const getGarudaApys = async () =>
  await getMasterChefApys({
    masterchef: '0xf6afB97aC5eAfAd60d3ad19c2f85E0Bd6b7eAcCf',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'garudaPerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'garuda-garuda',
        poolId: 6,
        token: '0x854086dC841e1bfae50Cb615bF41f55BF432a90b',
      },
    ],
    oracleId: 'GARUDA',
    oracle: 'tokens',
    decimals: '1e18',
    burn: 0.08, // 8%
    // log: true,
  });

module.exports = getGarudaApys;
