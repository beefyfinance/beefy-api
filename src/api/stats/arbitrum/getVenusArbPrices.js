const getVenusPrices = require('../common/getVenusPrices');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const corePools = require('../../../data/arbitrum/venusCorePools.json');
const lsPools = require('../../../data/arbitrum/venusLsPools.json');

const pools = [...corePools, ...lsPools];

const getVenusArbPrices = async tokenPrices => {
  return await getVenusPrices(chainId, pools, tokenPrices);
};

module.exports = getVenusArbPrices;
