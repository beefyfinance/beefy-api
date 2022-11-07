const getStableSwapPrices = require('../common/getStableSwapPrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const hopPools = require('../../../data/optimism/hopPools.json');
const opPools = require('../../../data/optimism/hopOpPools.json');

const pools = [...hopPools, ...opPools];

const getHopOpPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getHopOpPrices;
