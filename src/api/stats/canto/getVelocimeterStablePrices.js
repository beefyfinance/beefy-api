const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const v1pools = require('../../../data/canto/velocimeterStableLpPools.json');
const v2pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const { CANTO_CHAIN_ID } = require('../../../constants');
const pools = [...v1pools, ...v2pools];
const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(CANTO_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
