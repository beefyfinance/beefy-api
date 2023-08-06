const getStargatePrices = require('../common/getStargatePrices');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/base/stargateBasePools.json');

const getStargateBasePrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateBasePrices;
