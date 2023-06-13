const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/celo/curvePools.json');
const { CELO_CHAIN_ID } = require('../../../constants');

const getCurveCeloPrices = async tokenPrices => {
  return await getCurvePricesCommon(CELO_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCurveCeloPrices;
