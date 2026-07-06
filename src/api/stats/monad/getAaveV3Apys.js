const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/monad/aaveV3Pools.json');
const { MONAD_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0xB65A68B98274ef7D9a60E0C0747dD1BEc3D32fad',
  incentives: '0x6f275486dC3EF07691B846E500556774B2D98F59',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, MONAD_CHAIN_ID);
};
