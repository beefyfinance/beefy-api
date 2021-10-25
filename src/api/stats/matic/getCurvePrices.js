const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/curvePools.json');

const getCurvePolygonPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurvePolygonPrices;
