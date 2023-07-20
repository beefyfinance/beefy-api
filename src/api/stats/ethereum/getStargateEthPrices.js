const getStargatePrices = require('../common/getStargatePrices');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/ethereum/stargateEthPools.json');

const getStargateEthPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargateEthPrices;
