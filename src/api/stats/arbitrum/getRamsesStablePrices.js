const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/arbitrum/ramsesStableLpPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getRamsesStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getRamsesStablePrices;
