const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/matic/curvePools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const getCurvePolygonPrices = async tokenPrices => {
  return await getCurvePricesCommon(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurvePolygonPrices;
