const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/aurora/rosePools.json');
const { AURORA_CHAIN_ID } = require('../../../constants');

const getRosePrices = async tokenPrices => {
  return await getCurvePricesCommon(AURORA_CHAIN_ID, pools, tokenPrices);
};

module.exports = getRosePrices;
