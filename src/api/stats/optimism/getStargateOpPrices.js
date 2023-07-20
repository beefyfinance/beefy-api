const getStargatePrices = require('../common/getStargatePrices');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/optimism/stargateOpPools.json');

const getStargateOpPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateOpPrices;
