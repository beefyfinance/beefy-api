const getSiloPrices = require('../common/getSiloPrices');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/optimism/siloPools.json');

const getOptimismSiloPrices = async tokenPrices => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

module.exports = getOptimismSiloPrices;
