const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/aurora/trisolarisStableLpPools.json');
const { AURORA_CHAIN_ID } = require('../../../constants');

const getTrisolarisPrices = async tokenPrices => {
  return await getStableSwapPrices(AURORA_CHAIN_ID, pools, tokenPrices);
};

module.exports = getTrisolarisPrices;
