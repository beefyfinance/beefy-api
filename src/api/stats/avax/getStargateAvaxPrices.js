const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/avax/stargateV2AvaxPools.json');

const getStargateAvaxPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateAvaxPrices;
