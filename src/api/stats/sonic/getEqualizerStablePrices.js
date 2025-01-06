const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/sonic/equalizerStableLpPools.json');
const { SONIC_CHAIN_ID } = require('../../../constants');

const stablePools = [...pools];

const getEqualizerStableSonicPrices = async tokenPrices => {
  return await getSolidlyStablePrices(SONIC_CHAIN_ID, stablePools, tokenPrices);
};

module.exports = getEqualizerStableSonicPrices;
