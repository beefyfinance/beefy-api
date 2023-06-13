const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/avax/curvePools.json');
const { AVAX_CHAIN_ID } = require('../../../constants');

const getCurveAvaxPrices = async tokenPrices => {
  return await getCurvePricesCommon(AVAX_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveAvaxPrices;
