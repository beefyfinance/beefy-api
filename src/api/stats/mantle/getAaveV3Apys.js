const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/mantle/aaveV3Pools.json');
const { MANTLE_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x487c5c669D9eee6057C44973207101276cf73b68',
  incentives: '0x04EEC4892Ec41A056C66787211aE81A24460fF02',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, MANTLE_CHAIN_ID);
};
