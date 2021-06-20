const getMasterChefApys = require('./getMaticMasterChefApys');
const {
  addressBook: {
    polygon: {
      tokens: { YELD },
      platforms: { polyyeld },
    },
  },
} = require('blockchain-addressbook');

const MasterChefAbi = require('../../../abis/matic/PolyyeldMasterChef.json');
const pools = require('../../../data/matic/polyyeldLpPools.json');
const { quickClient } = require('../../../apollo/client');
const { quickLiquidityProviderFee } = require('./getQuickLpApys');

const getPolyyeldApys = async () => {
  const lps = getMasterChefApys({
    masterchef: polyyeld.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'YeldPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracle: 'tokens',
    oracleId: YELD.symbol,
    decimals: YELD.decimals,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
    // log: true,
  });

  let apys = {};
  const values = await Promise.all([lps]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = { getPolyyeldApys };
