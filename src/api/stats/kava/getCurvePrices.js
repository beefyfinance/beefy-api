const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { kavaWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/kava/curvePools.json');

const getCurveKavaPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveKavaPrices;
