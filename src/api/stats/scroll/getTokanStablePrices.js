const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/scroll/tokanStablePools.json');
const { SCROLL_CHAIN_ID: chainId } = require('../../../constants');

const getTokanStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

module.exports = getTokanStablePrices;
