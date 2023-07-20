const getGammaPrices = require('../common/getGammaPrices');
const pools = require('../../../data/degens/thenaGammaPools.json');
const { BSC_CHAIN_ID } = require('../../../constants');

const getThenaGammaPrices = async tokenPrices => {
  return await getGammaPrices(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getThenaGammaPrices;
