const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/fantom/curvePools.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const getCurveFantomPrices = async tokenPrices => {
  return await getCurvePricesCommon(FANTOM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveFantomPrices;
