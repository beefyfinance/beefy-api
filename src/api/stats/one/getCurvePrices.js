const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/one/curvePools.json');
const { ONE_CHAIN_ID } = require('../../../constants');

const getCurveHarmonyPrices = async tokenPrices => {
  return await getCurvePricesCommon(ONE_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveHarmonyPrices;
