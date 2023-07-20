const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/fantom/spiritStableLpPools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const getSpiritStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSpiritStablePrices;
