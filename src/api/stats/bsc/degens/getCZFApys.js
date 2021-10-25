const getMasterChefApys = require('./getBscMasterChefApys');

const pools = require('../../../../data/degens/CZFLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getCZFApys = async () =>
  await getMasterChefApys({
    masterchef: '0x57ceeB745370cdB666d0b771DCA2173C4e677141',
    tokenPerBlock: 'czfPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'CZF',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getCZFApys;
