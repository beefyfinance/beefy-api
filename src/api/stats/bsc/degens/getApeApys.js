const getMasterChefApys = require('./getBscMasterChefApys');

const pools = require('../../../../data/degens/apeLpPools.json');
const { apeClient } = require('../../../../apollo/client');
const { HOURLY_HPY } = require('../../../../constants');

const getApeApys = () =>
  getMasterChefApys({
    masterchef: '0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9',
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'banana-banana',
        poolId: 0,
        address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
        oracle: 'tokens',
        oracleId: 'BANANA',
        decimals: '1e18',
      },
      {
        name: 'banana-bananav2',
        poolId: 0,
        address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
        oracle: 'tokens',
        oracleId: 'BANANA',
        decimals: '1e18',
        hpy: HOURLY_HPY,
        perfFee: 0.04,
      },
    ],
    oracleId: 'BANANA',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: 0.0015,
    // log: true,
  });

module.exports = getApeApys;
