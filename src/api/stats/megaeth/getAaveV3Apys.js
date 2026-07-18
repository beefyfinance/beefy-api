import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';
import pools from '../../../data/megaeth/aaveV3Pools.json' with { type: "json" };
import { MEGAETH_CHAIN_ID } from '../../../constants.ts';

const config = {
  dataProvider: '0x9588b453A4EE24a420830CB3302195cA7aA3b403',
  incentives: '0x3691FF69e22c1353df9F8b2c0B1B16aA5fEEc389',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, MEGAETH_CHAIN_ID);
};
