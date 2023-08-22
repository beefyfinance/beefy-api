const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/base/basoStableLpPools.json');
const { BASE_CHAIN_ID } = require('../../../constants');

const getBasoStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(BASE_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBasoStablePrices;
