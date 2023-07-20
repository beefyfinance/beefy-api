const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/fuse/voltageStableLpPools.json');
const { FUSE_CHAIN_ID } = require('../../../constants');

const getVoltagePrices = async tokenPrices => {
  return await getStableSwapPrices(FUSE_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVoltagePrices;
