const getGammaPrices = require('../common/getGammaPrices');
const equalizerPools = require('../../../data/fantom/equalizerIchiPools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const pools = [...equalizerPools];
const getFtmIchiPrices = async tokenPrices => {
  return await getGammaPrices(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getFtmIchiPrices;
