const getCurvePricesCommon = require('../../common/curve/getCurvePricesCommon');
const pools = require('../../../../data/cakeStablePools.json');
const { BSC_CHAIN_ID } = require('../../../../constants');

const getCakeStablePrices = async tokenPrices => {
  return await getCurvePricesCommon(BSC_CHAIN_ID, pools, tokenPrices);
};

module.exports = getCakeStablePrices;
