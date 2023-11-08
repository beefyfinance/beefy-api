const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/metis/aaveV3Pools.json');
const { METIS_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
  incentives: '0x30C1b8F0490fa0908863d6Cbd2E36400b4310A6B',
  rewards: [
    {
      token: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
      oracle: 'tokens',
      oracleId: 'METIS',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, METIS_CHAIN_ID);
};

const getAavePoolData = async pool => {
  return getAaveV3PoolData(config, pool, METIS_CHAIN_ID);
};

module.exports = { getAaveV3Apys, getAavePoolData };
