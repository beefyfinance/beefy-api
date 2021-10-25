const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/arbitrum/curvePools.json');

const getCurveArbitrumPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveArbitrumPrices;
