const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/moonbeam/stellaswapStablePools.json');
const { MOONBEAM_CHAIN_ID } = require('../../../constants');

const getStellaswapPrices = async tokenPrices => {
  return await getStableSwapPrices(MOONBEAM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getStellaswapPrices;
