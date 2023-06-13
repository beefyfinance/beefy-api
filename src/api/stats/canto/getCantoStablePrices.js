const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/canto/cantoStableLpPools.json');
const { CANTO_CHAIN_ID } = require('../../../constants');

const getCantoStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(CANTO_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCantoStablePrices;
