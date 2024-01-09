const getRangePrices = require('../common/getRangePrices');
const pools = require('../../../data/bsc/pancakeRangePools.json');
const { BSC_CHAIN_ID: chainId } = require('../../../constants');

const getBscRangePrices = async tokenPrices => {
  return await getRangePrices(chainId, pools, tokenPrices);
};

module.exports = getBscRangePrices;
