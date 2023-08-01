const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const { CANTO_CHAIN_ID } = require('../../../constants');

const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(CANTO_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
