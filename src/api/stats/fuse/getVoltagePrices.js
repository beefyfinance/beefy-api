const getStableSwapPrices = require('../common/getStableSwapPrices');
const { fuseWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/fuse/voltageStableLpPools.json');

const getVoltagePrices = async tokenPrices => {
  return await getStableSwapPrices(web3, pools, tokenPrices);
};

module.exports = getVoltagePrices;
