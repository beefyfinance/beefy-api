const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/optimism/aaveV3Pools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
  incentives: '0x929EC64c34a17401F460460D4B9390518E5B473e',
  rewards: [
    {
      token: '0x4200000000000000000000000000000000000042',
      oracle: 'tokens',
      oracleId: 'OP',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, OPTIMISM_CHAIN_ID);
};

const getAavePoolData = async pool => {
  return getAaveV3PoolData(config, pool, OPTIMISM_CHAIN_ID);
};

module.exports = { getAaveV3Apys, getAavePoolData };
