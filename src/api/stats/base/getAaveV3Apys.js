import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';
import pools from '../../../data/base/aaveV3Pools.json' with { type: "json" };
import { BASE_CHAIN_ID } from '../../../constants.ts';

const config = {
  dataProvider: '0x0F43731EB8d45A581f4a36DD74F5f358bc90C73A',
  incentives: '0xf9cc4F0D883F1a1eb2c253bdb46c254Ca51E1F44',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, BASE_CHAIN_ID);
};
