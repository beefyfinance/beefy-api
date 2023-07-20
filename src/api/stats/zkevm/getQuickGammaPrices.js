const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/zkevm/quickGammaLpPools.json');
const { ZKEVM_CHAIN_ID } = require('../../../constants');

const getQuickGammaZkPrices = async tokenPrices => {
  return await getGammaPrices(ZKEVM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getQuickGammaZkPrices;
