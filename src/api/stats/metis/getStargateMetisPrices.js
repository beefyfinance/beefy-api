const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/metis/stargateV2MetisPools.json');

const getStargateMetisPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateMetisPrices;
