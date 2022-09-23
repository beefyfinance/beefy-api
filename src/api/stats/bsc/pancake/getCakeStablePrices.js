const getCurvePricesCommon = require('../../common/curve/getCurvePricesCommon');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const pools = require('../../../../data/cakeStablePools.json');

const getCakeStablePrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getCakeStablePrices;
