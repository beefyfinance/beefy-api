const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/matic/quickGammaLpPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getQuickGammaPrices = async tokenPrices => {
  return await getGammaPrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getQuickGammaPrices;
