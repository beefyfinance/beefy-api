const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { cantoWeb3: web3 } = require('../../../utils/web3');
const v1pools = require('../../../data/canto/velocimeterStableLpPools.json');
const v2pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const pools = [...v1pools, ...v2pools];
const getVelocimeterStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getVelocimeterStablePrices;
