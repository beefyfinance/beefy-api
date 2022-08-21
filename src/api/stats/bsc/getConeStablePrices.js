const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { bscWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/coneStableLpPools.json');

const getConeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getConeStablePrices;
