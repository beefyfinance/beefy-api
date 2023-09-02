const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/base/aerodromeStableLpPools.json');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

export const getAerodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};
