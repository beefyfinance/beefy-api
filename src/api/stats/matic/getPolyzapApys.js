const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolyzapMasterChef.json');
const pools = require('../../../data/matic/polyzapLpPools.json');
const { polyzapClient } = require('../../../apollo/client');

const getPolyzapApys = async () =>
  await getMasterChefApys({
    masterchef: '0xB93C082bCfCCf5BAeA0E0f0c556668E25A41B896',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'pZapPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'PZAP',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: polyzapClient,
    liquidityProviderFee: 0.002,
  });

module.exports = getPolyzapApys;
