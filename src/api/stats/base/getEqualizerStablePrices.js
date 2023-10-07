const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/base/equalizerStableLpPools.json');
const { BASE_CHAIN_ID } = require('../../../constants');

const stablePools = [...pools];

const getEqualizerStableBasePrices = async tokenPrices => {
  return await getSolidlyStablePrices(BASE_CHAIN_ID, stablePools, tokenPrices);
};

module.exports = getEqualizerStableBasePrices;
