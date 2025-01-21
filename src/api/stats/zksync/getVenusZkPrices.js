const getVenusPrices = require('../common/getVenusPrices');
const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
const corePools = require('../../../data/zksync/venusCorePools.json');

const pools = corePools;

const getVenusArbPrices = async tokenPrices => {
  return await getVenusPrices(chainId, pools, tokenPrices);
};

module.exports = getVenusArbPrices;
