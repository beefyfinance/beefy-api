const getJoeAutoPrices = require('../common/joe/getJoeAutoPrices');
const pools = require('../../../data/arbitrum/joeAutoPools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getJoeAutoArbPrices = async tokenPrices => {
  return await getJoeAutoPrices(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getJoeAutoArbPrices;
