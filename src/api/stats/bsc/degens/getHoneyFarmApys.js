const getMasterChefApys = require('./getBscMasterChefApys');

const pools = require('../../../../data/degens/honeyFarmLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getHoneyFarmApys = async () =>
  await getMasterChefApys({
    masterchef: '0x671e56C68047029F236f342b18632425C75885a3',
    tokenPerBlock: 'EarningsPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'MOON',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getHoneyFarmApys;
