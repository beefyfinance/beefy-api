const getTokemakPrices = require('../common/getTokemakPrices');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/ethereum/tokemakPools.json');

const getTokemakEthPrices = async tokenPrices => {
  return await getTokemakPrices(chainId, pools, tokenPrices);
};

export default getTokemakEthPrices;
