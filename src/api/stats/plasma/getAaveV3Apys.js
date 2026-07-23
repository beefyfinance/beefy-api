import { PLASMA_CHAIN_ID } from '../../../constants.ts';
import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';
import pools from '../../../data/plasma/aaveV3Pools.json' with { type: 'json' };

const config = {
  dataProvider: '0xf2D6E38B407e31E7E7e4a16E6769728b76c7419F',
  incentives: '0xcb85C501B3A5e9851850d66648d69B26A4c90942',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, PLASMA_CHAIN_ID);
};
