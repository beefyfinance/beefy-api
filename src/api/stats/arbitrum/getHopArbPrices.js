const getStableSwapPrices = require('../common/getStableSwapPrices');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/arbitrum/hopPools.json');

const getHopArbPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getHopArbPrices;
