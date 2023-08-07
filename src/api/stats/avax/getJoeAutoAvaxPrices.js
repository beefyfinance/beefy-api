const getJoeAutoPrices = require('../common/joe/getJoeAutoPrices');
const pools = require('../../../data/avax/joeAutoPools.json');
const { AVAX_CHAIN_ID } = require('../../../constants');

const getJoeAutoAvaxPrices = async tokenPrices => {
  return await getJoeAutoPrices(AVAX_CHAIN_ID, pools, tokenPrices);
};

module.exports = getJoeAutoAvaxPrices;
