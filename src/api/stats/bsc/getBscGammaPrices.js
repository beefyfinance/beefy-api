const getGammaPrices = require('../common/getGammaPrices');
const thenaPools = require('../../../data/degens/thenaGammaPools.json');
const pancakePools = require('../../../data/bsc/pancakeIchiPools.json');
const { BSC_CHAIN_ID } = require('../../../constants');

const pools = [...thenaPools, ...pancakePools];
const getBscGammaPrices = async tokenPrices => {
  return await getGammaPrices(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getBscGammaPrices;
