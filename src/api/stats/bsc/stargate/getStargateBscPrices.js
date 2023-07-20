const getStargatePrices = require('../../common/getStargatePrices');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const pools = require('../../../../data/bsc/stargateBscPools.json');

const getStargateBscPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateBscPrices;
