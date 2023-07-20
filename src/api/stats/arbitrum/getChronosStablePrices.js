const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/arbitrum/chronosStableLpPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getChronosStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getChronosStablePrices;
