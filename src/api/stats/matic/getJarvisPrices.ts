import getCurvePricesCommon from '../common/curve/getCurvePricesCommon';
import { polygonWeb3 as web3 } from '../../../utils/web3';
import pools from '../../../data/matic/jarvisPools.json';
import rewardPool from '../../../data/matic/jarvisRewardPool.json';
import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';

const getJarvisPrices = async tokenPrices => {
  const curvePrices = await getCurvePricesCommon(web3, pools, tokenPrices, true);
  let onlyPrices = Object.keys(curvePrices).reduce((prices, current) => {
    prices[current] = curvePrices[current].price;
    return prices;
  }, {});

  const dmmPrices = await fetchDmmPrices(rewardPool, onlyPrices);

  return {
    ...dmmPrices.tokenPrices,
    ...dmmPrices.poolPrices,
    ...dmmPrices.lpsBreakdown,
    ...curvePrices,
  };
};

export default getJarvisPrices;
