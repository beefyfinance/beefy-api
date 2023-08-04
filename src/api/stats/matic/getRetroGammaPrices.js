const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/matic/retroGammaPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getRetroGammaPrices = async tokenPrices => {
  return await getGammaPrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getRetroGammaPrices;
