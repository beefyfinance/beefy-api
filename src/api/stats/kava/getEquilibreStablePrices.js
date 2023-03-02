const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { kavaWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/kava/equilibreStableLpPools.json');

const getEquilibreStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getEquilibreStablePrices;
