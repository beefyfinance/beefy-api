const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/avax/soliSnekStableLpPools.json');
const { AVAX_CHAIN_ID } = require('../../../constants');

const getSoliSnekStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(AVAX_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSoliSnekStablePrices;
