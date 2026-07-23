import { MANTLE_CHAIN_ID } from '../../../constants.ts';
import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';
import pools from '../../../data/mantle/aaveV3Pools.json' with { type: 'json' };

const config = {
  dataProvider: '0x487c5c669D9eee6057C44973207101276cf73b68',
  incentives: '0x04EEC4892Ec41A056C66787211aE81A24460fF02',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, MANTLE_CHAIN_ID);
};
