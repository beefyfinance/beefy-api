const getStargatePrices = require('../common/getStargatePrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/matic/stargatePolygonPools.json');

const getStargatePolygonPrices = async tokenPrices => {
  return await getStargatePrices(web3, chainId, pools, tokenPrices);
};

module.exports = getStargatePolygonPrices;
