import { MONAD_CHAIN_ID } from '../../../constants.ts';
import { getAaveV3ApyData } from '../common/aave/getAaveV3Apys.js';
import pools from '../../../data/monad/aaveV3Pools.json' with { type: 'json' };

const config = {
  dataProvider: '0xB65A68B98274ef7D9a60E0C0747dD1BEc3D32fad',
  incentives: '0x6f275486dC3EF07691B846E500556774B2D98F59',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, MONAD_CHAIN_ID);
};
