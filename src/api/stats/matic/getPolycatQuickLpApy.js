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
const {
  getScientificNotationFromTokenDecimals,
} = require('../../../utils/getScientificNotationFromTokenDecimals');

const getPolycatQuickLpApy = async () =>
  await getMasterChefApys({
    masterchef: polycat.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: FISH.symbol,
    oracle: 'tokens',
    decimals: getScientificNotationFromTokenDecimals(FISH.decimals),
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
  });

module.exports = getPolycatQuickLpApy;
