const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { moonbeamWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/moonbeam/curvePools.json');

const getCurveMoonbeamPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCurveMoonbeamPrices;
