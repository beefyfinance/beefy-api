const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { bscWeb3: web3 } = require('../../../utils/web3');
const v1Pools = require('../../../data/degens/thenaStableLpPools.json');
const v2Pools = require('../../../data/degens/thenaV2StableLpPools.json');

const pools = [...v1Pools, ...v2Pools];

const getThenaStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getThenaStablePrices;
