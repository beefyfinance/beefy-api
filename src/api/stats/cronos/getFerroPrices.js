const getStableSwapPrices = require('../common/getStableSwapPrices');
const pools = require('../../../data/cronos/ferroPools.json');
const { CRONOS_CHAIN_ID } = require('../../../constants');

const getFerroPrices = async tokenPrices => {
  return await getStableSwapPrices(CRONOS_CHAIN_ID, pools, tokenPrices);
};

module.exports = getFerroPrices;
