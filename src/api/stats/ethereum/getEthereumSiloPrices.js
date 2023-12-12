const getSiloPrices = require('../common/getSiloPrices');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/ethereum/siloPools.json');

const getEthSiloPrices = async tokenPrices => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

module.exports = getEthSiloPrices;
