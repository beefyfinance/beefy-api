const getStargatePrices = require('../common/getStargatePrices');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/fantom/stargateFantomPools.json');

const getStargateFantomPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateFantomPrices;
