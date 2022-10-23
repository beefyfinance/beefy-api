const getStableSwapPrices = require('../common/getStableSwapPrices');
const { moonbeamWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/moonbeam/stellaswapStablePools.json');

const getStellaswapPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getStellaswapPrices;
