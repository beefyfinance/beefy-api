const { getAaveV3ApyData, getAaveV3PoolData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/arbitrum/aaveV3Pools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
  incentives: '0x929EC64c34a17401F460460D4B9390518E5B473e',
  rewards: [
    {
      token: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      oracle: 'tokens',
      oracleId: 'ARB',
      decimals: '1e18',
    },
  ],
};

const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, ARBITRUM_CHAIN_ID);
};

const getAavePoolData = async pool => {
  return getAaveV3PoolData(config, pool, ARBITRUM_CHAIN_ID);
};

module.exports = { getAaveV3Apys, getAavePoolData };
