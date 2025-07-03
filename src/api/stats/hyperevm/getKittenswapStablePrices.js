const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/hyperevm/kittenswapStablePools.json');
const { HYPEREVM_CHAIN_ID: chainId } = require('../../../constants');

export const getKittenswapStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};
