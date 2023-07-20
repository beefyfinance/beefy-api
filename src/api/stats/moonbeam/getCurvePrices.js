const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/moonbeam/curvePools.json');
const { MOONBEAM_CHAIN_ID } = require('../../../constants');

const getCurveMoonbeamPrices = async tokenPrices => {
  return await getCurvePricesCommon(MOONBEAM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveMoonbeamPrices;
