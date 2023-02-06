import { fetchDmmPrices } from '../../../utils/fetchDmmPrices';
const pools = require('../../../data/arbitrum/kyberLpPools.json');

const getKyberArbitrumPrices = async tokenPrices => {
  const priceData = await await fetchDmmPrices(pools, tokenPrices);
  return {
    ...priceData.poolPrices,
    ...priceData.lpsBreakdown,
  };
};

export { getKyberArbitrumPrices };
