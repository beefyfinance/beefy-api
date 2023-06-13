const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/fantom/solidlyStableLpPools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const getSolidlyV1StablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSolidlyV1StablePrices;
