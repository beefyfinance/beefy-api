const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/dystopiaStableLpPools.json');

const getDystopiaStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getDystopiaStablePrices;
