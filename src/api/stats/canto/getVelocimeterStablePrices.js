const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { cantoWeb3: web3 } = require('../../../utils/web3');
const v2pools = require('../../../data/canto/velocimeterV2StableLpPools.json');

const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, v2pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
