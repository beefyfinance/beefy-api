const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/uniswapLpPools.json');

const getUniV3PolygonPrices = async tokenPrices => {
  return await getUniV3PositionPrices(web3, pools, tokenPrices);
};

module.exports = getUniV3PolygonPrices;
