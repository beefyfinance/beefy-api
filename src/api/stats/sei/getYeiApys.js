const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/sei/yeiPools.json');
const { SEI_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x60c82A40C57736a9c692C42e87A8849Fb407F0d6',
  incentives: '0x60485C5E5E3D535B16CC1bd2C9243C7877374259',
  rewards: [
    {
      token: '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7',
      oracle: 'tokens',
      oracleId: 'WSEI',
      decimals: '1e18',
    },
    {
      token: '0x5Cf6826140C1C56Ff49C808A1A75407Cd1DF9423',
      oracle: 'tokens',
      oracleId: 'iSEI',
      decimals: '1e18',
    },
  ],
};

const getYeiApys = async () => {
  return getAaveV3ApyData(config, pools, SEI_CHAIN_ID);
};

const getYeiPoolData = async pool => {
  return getAaveV3PoolData(config, pool, SEI_CHAIN_ID);
};

module.exports = { getYeiApys, getYeiPoolData };
