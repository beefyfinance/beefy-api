const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/arbitrum/solidlizardStableLpPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getSolidLizardStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getSolidLizardStablePrices;
