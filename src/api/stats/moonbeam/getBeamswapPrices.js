const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/moonbeam/beamswapStableLpPools.json');
const { MOONBEAM_CHAIN_ID } = require('../../../constants');

const getBeamswapPrices = async tokenPrices => {
  return await getStableSwapPrices(MOONBEAM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBeamswapPrices;
