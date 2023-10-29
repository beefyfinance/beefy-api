const getGammaPrices = require('../common/getGammaPrices');
const uniPools = require('../../../data/arbitrum/uniswapGammaPools.json');
const sushiPools = require('../../../data/arbitrum/sushiGammaPools.json');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...uniPools, ...sushiPools];
const getGammaArbPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getGammaArbPrices;
