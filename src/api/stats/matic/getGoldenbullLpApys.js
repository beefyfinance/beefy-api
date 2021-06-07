const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolyzapMasterChef.json');
const pools = require('../../../data/matic/goldenbullLpPools.json');
const { quickClient } = require('../../../apollo/client');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { goldenbull },
    tokens: { GBULL },
  },
} = addressBook;

const getGoldenbullLpApys = async () =>
  await getMasterChefApys({
    masterchef: goldenbull.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'pZapPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'PZAP',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.002,
  });

module.exports = getGoldenbullLpApys;
