const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/kava/equilibreStableLpPools.json');
const { KAVA_CHAIN_ID } = require('../../../constants');

const getEquilibreStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(KAVA_CHAIN_ID, pools, tokenPrices);
};

module.exports = getEquilibreStablePrices;
