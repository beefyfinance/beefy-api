const getStableSwapPrices = require('../common/getStableSwapPrices');
const hopPools = require('../../../data/arbitrum/hopPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const pools = [...hopPools];

const getHopArbPrices = async tokenPrices => {
  return await getStableSwapPrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getHopArbPrices;
