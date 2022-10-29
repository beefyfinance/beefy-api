const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/ethereum/convexPools.json');

export const getCurveEthereumPrices = async tokenPrices => {
  return await getCurvePricesCommon(web3, pools, tokenPrices);
};
