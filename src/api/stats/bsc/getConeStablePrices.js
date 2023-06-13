const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/coneStableLpPools.json');
const { BSC_CHAIN_ID } = require('../../../constants');

const getConeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getConeStablePrices;
