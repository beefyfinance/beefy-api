const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { MANTLE_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/mantle/stargateV2MantlePools.json');

const getStargateMantlePrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateMantlePrices;
