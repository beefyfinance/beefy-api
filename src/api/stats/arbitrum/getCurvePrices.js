const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/arbitrum/curvePools.json');
const { ARBITRUM_CHAIN_ID } = require('../../../constants');

const getCurveArbitrumPrices = async tokenPrices => {
  return await getCurvePricesCommon(ARBITRUM_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveArbitrumPrices;
