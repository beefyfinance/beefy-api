const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/matic/dystopiaStableLpPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getDystopiaStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getDystopiaStablePrices;
