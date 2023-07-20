const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/matic/hopPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getHopPolyPrices = async tokenPrices => {
  return await getStableSwapPrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getHopPolyPrices;
