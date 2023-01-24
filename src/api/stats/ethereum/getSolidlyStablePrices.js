const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/ethereum/solidlyStableLpPools.json');

const getSolidlyEthStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(web3, pools, tokenPrices);
};

module.exports = getSolidlyEthStablePrices;
