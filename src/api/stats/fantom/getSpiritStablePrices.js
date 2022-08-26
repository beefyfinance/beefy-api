const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/spiritStableLpPools.json');

const getSpiritStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getSpiritStablePrices;
