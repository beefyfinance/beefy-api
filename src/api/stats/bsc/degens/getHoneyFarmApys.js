const getMasterChefApys = require('./getBscMasterChefApys');

const pools = require('../../../../data/degens/honeyFarmLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getHoneyFarmApys = async () =>
  await getMasterChefApys({
    masterchef: '0xc3D910c9D2bB024931a44Cf127B6231aC1F04de3',
    tokenPerBlock: 'EarningsPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BEAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getHoneyFarmApys;
