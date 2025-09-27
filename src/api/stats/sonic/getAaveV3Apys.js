const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/sonic/aaveV3Pools.json');
const { SONIC_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x306c124fFba5f2Bc0BcAf40D249cf19D492440b9',
  incentives: '0x3A57eAa3Ca3794D66977326af7991eB3F6dD5a5A',
  rewards: [],
};

export const getAaveV3Apys = async () => {
  return getAaveV3ApyData(config, pools, SONIC_CHAIN_ID);
};
