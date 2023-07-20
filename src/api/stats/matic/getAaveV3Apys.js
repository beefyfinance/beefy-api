const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/matic/aaveV3Pools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  incentives: '0x929EC64c34a17401F460460D4B9390518E5B473e',
  rewards: [
    {
      token: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      oracle: 'tokens',
      oracleId: 'WMATIC',
      decimals: '1e18',
    },
    {
      token: '0xC3C7d422809852031b44ab29EEC9F1EfF2A58756',
      oracle: 'tokens',
      oracleId: 'LDO',
      decimals: '1e18',
    },
    {
      token: '0x1d734A02eF1e1f5886e66b0673b71Af5B53ffA94',
      oracle: 'tokens',
      oracleId: 'SD',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, POLYGON_CHAIN_ID);
};

const getAavePoolData = async pool => {
  return getAaveV3PoolData(config, pool, POLYGON_CHAIN_ID);
};

module.exports = { getAaveV3Apys, getAavePoolData };
