const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const pools = require('../../../data/base/curvePools.json');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

export const getCurveBasePrices = async tokenPrices => {
  return await getCurvePricesCommon(chainId, pools, tokenPrices);
};
