const getStableSwapPrices = require('../common/getStableSwapPrices');
const hopPools = require('../../../data/arbitrum/hopPools.json');
const rplPools = require('../../../data/arbitrum/hopRplPools.json');
const arbPools = require('../../../data/arbitrum/hopArbPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const pools = [...hopPools, ...rplPools, ...arbPools];

const getHopArbPrices = async tokenPrices => {
  return await getStableSwapPrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getHopArbPrices;
