const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { auroraWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/aurora/rosePools.json');

const getRosePrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};

module.exports = getRosePrices;
