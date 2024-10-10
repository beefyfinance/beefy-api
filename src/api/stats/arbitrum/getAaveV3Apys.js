const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/arbitrum/aaveV3Pools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
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

module.exports = { getAaveV3Apys };
