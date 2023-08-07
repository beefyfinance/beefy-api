const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/optimism/uniswapGammaLpPools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const getUniswapGammaPrices = async tokenPrices => {
  return await getGammaPrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getUniswapGammaPrices;
