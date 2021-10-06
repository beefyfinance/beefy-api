const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { avaxWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/avax/curvePools.json');

const getCurveAvaxPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveAvaxPrices;
