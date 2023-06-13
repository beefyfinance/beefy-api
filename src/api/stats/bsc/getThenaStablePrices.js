const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/degens/thenaStableLpPools.json');
const { BSC_CHAIN_ID } = require('../../../constants');

const getThenaStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getThenaStablePrices;
