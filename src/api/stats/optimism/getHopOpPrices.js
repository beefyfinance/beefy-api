const getStableSwapPrices = require('../common/getStableSwapPrices');
const hopPools = require('../../../data/optimism/hopPools.json');
const opPools = require('../../../data/optimism/hopOpPools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const pools = [...hopPools, ...opPools];

const getHopOpPrices = async tokenPrices => {
  return await getStableSwapPrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getHopOpPrices;
