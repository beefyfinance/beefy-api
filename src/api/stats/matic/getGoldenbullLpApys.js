const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/GoldenbullMasterChef.json');
const pools = require('../../../data/matic/goldenbullLpPools.json');
const { quickClient } = require('../../../apollo/client');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { goldenbull },
    tokens: { GBULL },
  },
} = addressBook;
const { quickLiquidityProviderFee } = require('./getQuickLpApys');

const getGoldenbullLpApys = async () =>
  await getMasterChefApys({
    masterchef: goldenbull.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'gBullPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: GBULL.symbol,
    oracle: 'tokens',
    decimals: '1e' + GBULL.decimals.toString(),
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
  });

module.exports = getGoldenbullLpApys;
