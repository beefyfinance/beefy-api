const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/base/bvmStableLpPools.json');
const { BASE_CHAIN_ID } = require('../../../constants');

const getBvmStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(BASE_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBvmStablePrices;
