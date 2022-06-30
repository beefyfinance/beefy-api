const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/optimism/velodromeStableLpPools.json');

const getVelodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getVelodromeStablePrices;
