const getStargatePrices = require('../common/getStargatePrices');
const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const poolsV1 = require('../../../data/matic/stargatePolygonPools.json');
const poolsV2 = require('../../../data/matic/stargateV2PolygonPools.json');

const getStargatePolygonPrices = async tokenPrices => {
  const pricesV1 = await getStargatePrices(chainId, poolsV1, tokenPrices);
  const pricesV2 = await getStargateV2Prices(chainId, poolsV2, tokenPrices);
  return { ...pricesV1, ...pricesV2 };
};

module.exports = getStargatePolygonPrices;
