import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';
const pools = require('../../../data/avax/kyberV2LpPools.json');

const getKyberAvaxPrices = async tokenPrices => {
  const priceData = await await fetchDmmPrices(pools, tokenPrices);
  return {
    ...priceData.poolPrices,
    ...priceData.lpsBreakdown,
  };
};

export { getKyberAvaxPrices };
