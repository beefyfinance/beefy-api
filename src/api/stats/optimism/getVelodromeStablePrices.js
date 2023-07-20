const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const newPools = require('../../../data/optimism/velodromeStableLpPools.json');
const oldPools = require('../../../data/optimism/oldVelodromeStableLpPools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const pools = [...oldPools, ...newPools];
const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelodromeStablePrices;
