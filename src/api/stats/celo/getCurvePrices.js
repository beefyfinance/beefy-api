const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { celoWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/celo/curvePools.json');

const getCurveCeloPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveCeloPrices;
