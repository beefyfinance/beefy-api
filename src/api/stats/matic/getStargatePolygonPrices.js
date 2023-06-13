const getStargatePrices = require('../common/getStargatePrices');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/matic/stargatePolygonPools.json');

const getStargatePolygonPrices = async tokenPrices => {
  return await getStargatePrices(chainId, pools, tokenPrices);
};

module.exports = getStargatePolygonPrices;
