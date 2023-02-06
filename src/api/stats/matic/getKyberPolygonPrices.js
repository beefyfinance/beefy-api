import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';
const pools = require('../../../data/matic/kyberV2LpPools.json');

const getKyberPolygonPrices = async tokenPrices => {
  const priceData = await await fetchDmmPrices(pools, tokenPrices);
  return {
    ...priceData.poolPrices,
    ...priceData.lpsBreakdown,
  };
};

export { getKyberPolygonPrices };
