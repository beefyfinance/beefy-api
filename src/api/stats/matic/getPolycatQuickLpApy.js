const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolycatMasterChef.json');
const pools = require('../../../data/matic/polycatQuickLpPool.json');
const { quickClient } = require('../../../apollo/client');
const { addressBook } = require('blockchain-addressbook');
const { quickLiquidityProviderFee } = require('./getQuickLpApys');
const {
  polygon: {
    platforms: { polycat },
    tokens: { FISH },
  },
} = addressBook;
const { getEDecimals } = require('../../../utils/getEDecimals');

const getPolycatQuickLpApy = async () =>
  await getMasterChefApys({
    masterchef: polycat.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: FISH.symbol,
    oracle: 'tokens',
    decimals: getEDecimals(FISH.decimals),
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
  });

module.exports = getPolycatQuickLpApy;
