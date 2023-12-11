const getGammaPrices = require('../common/getGammaPrices');
const uniPools = require('../../../data/arbitrum/uniswapGammaPools.json');
const uniChefPools = require('../../../data/arbitrum/uniswapGammaChefPools.json');
const sushiPools = require('../../../data/arbitrum/sushiGammaPools.json');
const pancakePools = require('../../../data/arbitrum/pancakeGammaPools.json');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...uniPools, ...uniChefPools, ...sushiPools, ...pancakePools];
const getGammaArbPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getGammaArbPrices;
