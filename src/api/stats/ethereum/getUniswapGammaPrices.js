const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/ethereum/uniswapGammaLpPools.json');
const { ETH_CHAIN_ID } = require('../../../constants');

const getUniswapGammaPrices = async tokenPrices => {
  return await getGammaPrices(ETH_CHAIN_ID, pools, tokenPrices);
};

module.exports = getUniswapGammaPrices;
