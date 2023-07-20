const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/metis/hermesStableLpPools.json');
const { METIS_CHAIN_ID } = require('../../../constants');

const getHermesStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(METIS_CHAIN_ID, pools, tokenPrices);
};

module.exports = getHermesStablePrices;
