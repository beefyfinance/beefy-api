const getSiloPrices = require('../common/getSiloPrices');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/base/siloPools.json');

const getBaseSiloPrices = async tokenPrices => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

module.exports = getBaseSiloPrices;
