const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { zksyncWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/zksync/velocoreStableLpPools.json');

const getVelocoreStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getVelocoreStablePrices;
