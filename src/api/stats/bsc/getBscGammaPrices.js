const getGammaPrices = require('../common/getGammaPrices');
const thenaPools = require('../../../data/bsc/thenaGammaPools.json');
const { BSC_CHAIN_ID } = require('../../../constants');

const pools = [...thenaPools];
const getBscGammaPrices = async tokenPrices => {
  return await getGammaPrices(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBscGammaPrices;
