const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { oneWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/one/curvePools.json');

const getCurveHarmonyPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveHarmonyPrices;
