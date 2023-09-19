const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/arbitrum/uniswapGammaPools.json');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const getUniswapGammaArbPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getUniswapGammaArbPrices;
