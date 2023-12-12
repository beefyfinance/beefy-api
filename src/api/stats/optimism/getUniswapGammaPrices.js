const getGammaPrices = require('../common/getGammaPrices');
const uniPools = require('../../../data/optimism/uniswapGammaLpPools.json');
const merklPools = require('../../../data/optimism/merklGammaLpPools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const pools = [...uniPools, ...merklPools];
const getUniswapGammaPrices = async tokenPrices => {
  return await getGammaPrices(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getUniswapGammaPrices;
