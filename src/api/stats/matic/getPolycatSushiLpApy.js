const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolycatMasterChef.json');
const pools = require('../../../data/matic/polycatSushiLpPool.json');
const { sushiClient } = require('../../../apollo/client');
const { sushiLiquidityProviderFee } = require('./getSushiLpApys');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { polycat },
    tokens: { FISH },
  },
} = addressBook;
const {
  getScientificNotationFromTokenDecimals,
} = require('../../../utils/getScientificNotationFromTokenDecimals');

const getPolycatSushiLpApy = async () =>
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
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: sushiLiquidityProviderFee,
  });

module.exports = getPolycatSushiLpApy;
