const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/kava/curvePools.json');
const { KAVA_CHAIN_ID } = require('../../../constants');

const getCurveKavaPrices = async tokenPrices => {
  return await getCurvePricesCommon(KAVA_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveKavaPrices;
