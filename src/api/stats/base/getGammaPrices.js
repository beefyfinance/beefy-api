const getGammaPrices = require('../common/getGammaPrices');

const sushiPools = require('../../../data/base/sushiGammaPools.json');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...sushiPools];
const getGammaArbPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getGammaArbPrices;
