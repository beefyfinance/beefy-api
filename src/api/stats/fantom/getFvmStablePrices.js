const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/fantom/fvmStableLpPools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const getFvmStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getFvmStablePrices;
