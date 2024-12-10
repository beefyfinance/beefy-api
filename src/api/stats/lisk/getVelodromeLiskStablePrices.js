const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/lisk/velodromeLiskStablePools.json');
const { LISK_CHAIN_ID } = require('../../../constants');

const getVelodromeLiskStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(LISK_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelodromeLiskStablePrices;
