const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { cantoWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/canto/velocimeterStableLpPools.json');

const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
