const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolycatMasterChef.json');
const pools = require('../../../data/matic/polycatQuickLpPool.json');
const { quickClient } = require('../../../apollo/client');

const getPolycatQuickLpApy = async () =>
  await getMasterChefApys({
    masterchef: '0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'FISH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.003,
  });

module.exports = getPolycatQuickLpApy;
