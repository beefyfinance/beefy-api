const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const v2pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const { CANTO_CHAIN_ID } = require('../../../constants');

const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(CANTO_CHAIN_ID, v2pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
