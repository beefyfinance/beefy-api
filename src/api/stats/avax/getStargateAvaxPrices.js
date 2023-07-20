const getStargatePrices = require('../common/getStargatePrices');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/avax/stargateAvaxPools.json');

const getStargateAvaxPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateAvaxPrices;
