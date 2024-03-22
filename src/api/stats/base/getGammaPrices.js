const getGammaPrices = require('../common/getGammaPrices');

const sushiPools = require('../../../data/base/sushiGammaPools.json');
const equalizerIchiPools = require('../../../data/base/equalizerIchiPools.json');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...sushiPools, ...equalizerIchiPools];
const getGammaArbPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getGammaArbPrices;
