const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolyzapMasterChef.json');
const pools = require('../../../data/matic/polyzapLpPools.json');
const { polyzapClient } = require('../../../apollo/client');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { polyzap },
    tokens: { PZAP },
  },
} = addressBook;
const {
  getScientificNotationFromTokenDecimals,
} = require('../../../utils/getScientificNotationFromTokenDecimals');

const getPolyzapApys = async () =>
  await getMasterChefApys({
    masterchef: polyzap.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'pZapPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: PZAP.symbol,
    oracle: 'tokens',
    decimals: getScientificNotationFromTokenDecimals(PZAP.decimals),
    // log: true,
    tradingFeeInfoClient: polyzapClient,
    liquidityProviderFee: 0.002,
  });

module.exports = getPolyzapApys;
