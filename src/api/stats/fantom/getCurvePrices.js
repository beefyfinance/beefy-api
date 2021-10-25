const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/curvePools.json');

const getCurveFantomPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveFantomPrices;
