const getMasterChefApys = require('./getBscMasterChefApys');

const pools = require('../../../../data/degens/honeyFarmLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getHoneyFarmApys = async () =>
  await getMasterChefApys({
    masterchef: '0x09Bfd9BEA89db8a0Cc1bFB5b3e0c39c84E7F38B5',
    tokenPerBlock: 'EarningsPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'HONEY',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getHoneyFarmApys;
