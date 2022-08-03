import getCurvePricesCommon from '../common/curve/getCurvePricesCommon';
import { polygonWeb3 as web3 } from '../../../utils/web3';
import pools from '../../../data/matic/jarvisPools.json';
import rewardPool from '../../../data/matic/jarvisRewardPool.json';
import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';

const getJarvisPrices = async tokenPrices => {
  const curvePrices = await getCurvePricesCommon(web3, pools, tokenPrices, false);
  const dmmPrices = await fetchDmmPrices(rewardPool, curvePrices);
  return dmmPrices.tokenPrices;
};

export default getJarvisPrices;
