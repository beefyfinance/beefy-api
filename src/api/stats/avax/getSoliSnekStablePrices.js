const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { avaxWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/avax/soliSnekStableLpPools.json');

const getSoliSnekStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getSoliSnekStablePrices;
