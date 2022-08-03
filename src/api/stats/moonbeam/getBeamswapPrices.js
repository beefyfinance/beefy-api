const getStableSwapPrices = require('../common/getStableSwapPrices');
const { moonbeamWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/moonbeam/beamswapStableLpPools.json');

const getBeamswapPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getBeamswapPrices;
