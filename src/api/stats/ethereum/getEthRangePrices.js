const getRangePrices = require('../common/getRangePrices');
const pools = require('../../../data/ethereum/rangeLpPools.json');
const { ETH_CHAIN_ID } = require('../../../constants');

const getEthRangePrices = async tokenPrices => {
  return await getRangePrices(ETH_CHAIN_ID, pools, tokenPrices);
};

module.exports = getEthRangePrices;
