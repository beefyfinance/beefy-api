const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolycatMasterChef.json');
const pools = require('../../../data/matic/polycatSushiLpPool.json');
const { sushiClient } = require('../../../apollo/client');

const getPolycatSushiLpApy = async () =>
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
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: 0.0025,
  });

module.exports = getPolycatSushiLpApy;
