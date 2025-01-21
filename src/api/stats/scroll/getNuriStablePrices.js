const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/scroll/nuriStablePools.json');
const { SCROLL_CHAIN_ID: chainId } = require('../../../constants');

const getNuriStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};

module.exports = getNuriStablePrices;
