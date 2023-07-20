const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/optimism/curvePools.json');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');

const getCurveOptimismPrices = async tokenPrices => {
  return await getCurvePricesCommon(OPTIMISM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveOptimismPrices;
