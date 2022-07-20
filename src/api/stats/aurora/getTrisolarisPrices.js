const getStableSwapPrices = require('../common/getStableSwapPrices');
const { auroraWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/aurora/trisolarisStableLpPools.json');

const getTrisolarisPrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getTrisolarisPrices;
