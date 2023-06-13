import getCurvePricesCommon from '../common/curve/getCurvePricesCommon';
import pools from '../../../data/matic/jarvisPools.json';
import rewardPool from '../../../data/matic/jarvisRewardPool.json';
import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';
import { POLYGON_CHAIN_ID } from '../../../constants';

const getJarvisPrices = async tokenPrices => {
  const curvePrices = await getCurvePricesCommon(POLYGON_CHAIN_ID, pools, tokenPrices);
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
