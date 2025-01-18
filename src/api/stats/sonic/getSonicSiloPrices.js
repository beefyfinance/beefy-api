const getSiloPrices = require('../common/getSiloPrices');
const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/sonic/siloPools.json');

const getSonicSiloPrices = async tokenPrices => {
  return await getSiloPrices(chainId, pools, tokenPrices);
};

module.exports = getSonicSiloPrices;
