const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const v1Pools = require('../../../data/fantom/equalizerStableLpPools.json');
const v2Pools = require('../../../data/fantom/equalizerV2StableLpPools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const pools = [...v1Pools, ...v2Pools];

const getEqualizerStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getEqualizerStablePrices;
