const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/optimism/velodromeStableLpPools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelodromeStablePrices;
