const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/optimism/curvePools.json');

const getCurveOptimismPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveOptimismPrices;
