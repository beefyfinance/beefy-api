const getSiloPrices = require('../common/getSiloPrices');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/arbitrum/siloPools.json');

const getArbitrumSiloPrices = async tokenPrices => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

module.exports = getArbitrumSiloPrices;
