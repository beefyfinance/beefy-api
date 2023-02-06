import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';
const pools = require('../../../data/optimism/kyberLpPools.json');

const getKyberOptimismPrices = async tokenPrices => {
  const priceData = await fetchDmmPrices(pools, tokenPrices);
  return {
    ...priceData.poolPrices,
    ...priceData.lpsBreakdown,
  };
};

export { getKyberOptimismPrices };
