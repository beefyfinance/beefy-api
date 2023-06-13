const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/ethereum/solidlyStableLpPools.json');
const { ETH_CHAIN_ID } = require('../../../constants');

const getSolidlyEthStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(ETH_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSolidlyEthStablePrices;
