const getStargatePrices = require('../common/getStargatePrices');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/arbitrum/stargateArbPools.json');

const getStargateArbPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateArbPrices;
