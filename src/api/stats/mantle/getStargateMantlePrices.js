const getStargatePrices = require('../common/getStargatePrices');
const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { MANTLE_CHAIN_ID: chainId } = require('../../../constants');
const poolsV1 = require('../../../data/mantle/stargateMantlePools.json');
const poolsV2 = require('../../../data/mantle/stargateV2MantlePools.json');

const getStargateMantlePrices = async tokenPrices => {
  const pricesV1 = await getStargatePrices(chainId, poolsV1, tokenPrices);
  const pricesV2 = await getStargateV2Prices(chainId, poolsV2, tokenPrices);
  return { ...pricesV1, ...pricesV2 };
};

module.exports = getStargateMantlePrices;
