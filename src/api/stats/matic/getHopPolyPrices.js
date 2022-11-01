const getStableSwapPrices = require('../common/getStableSwapPrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/hopPools.json');

const getHopPolyPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getHopPolyPrices;
