const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/avax/aaveV3Pools.json');

const config = {
  dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  incentives: '0x929EC64c34a17401F460460D4B9390518E5B473e',
  rewards: [
    {
      token: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      oracle: 'tokens',
      oracleId: 'AVAX',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools);
};

const getAavePoolData = async pool => {
  return getAaveV3PoolData(config, pool);
};

module.exports = { getAaveV3Apys, getAavePoolData };
