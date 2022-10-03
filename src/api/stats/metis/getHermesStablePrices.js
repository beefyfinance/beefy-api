const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { metisWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/metis/hermesStableLpPools.json');

const getHermesStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getHermesStablePrices;
