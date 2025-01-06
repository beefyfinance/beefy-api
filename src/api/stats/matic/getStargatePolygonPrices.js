const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/matic/stargateV2PolygonPools.json');

const getStargatePolygonPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargatePolygonPrices;
