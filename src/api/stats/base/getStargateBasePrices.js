const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/base/stargateV2BasePools.json');

const getStargateBasePrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateBasePrices;
