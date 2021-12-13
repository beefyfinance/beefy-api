const getCurvePricesCommon = require('../common/curve/getCurvePricesCommon');
const { polygonWeb3: web3 } = require('../../../utils/web3');
const pools = require('../../../data/matic/jarvisPools.json');
const rewardPool = require('../../../data/matic/jarvisRewardPool.json');
import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';

const getJarvisPrices = async tokenPrices => {
  const curvePrices = await getCurvePricesCommon(web3, pools, tokenPrices);
  const dmmPrices = await fetchDmmPrices(rewardPool, curvePrices);
  return dmmPrices.tokenPrices;
};

module.exports = getJarvisPrices;
