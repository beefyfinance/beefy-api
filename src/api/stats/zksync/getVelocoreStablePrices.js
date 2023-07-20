const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/zksync/velocoreStableLpPools.json');
const { ZKSYNC_CHAIN_ID } = require('../../../constants');

const getVelocoreStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(ZKSYNC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelocoreStablePrices;
