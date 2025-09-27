const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/plasma/aaveV3Pools.json');
const { PLASMA_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0xf2D6E38B407e31E7E7e4a16E6769728b76c7419F',
  incentives: '0xcb85C501B3A5e9851850d66648d69B26A4c90942',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, PLASMA_CHAIN_ID);
};
