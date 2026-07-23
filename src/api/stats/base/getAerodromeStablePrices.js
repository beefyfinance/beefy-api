import { BASE_CHAIN_ID as chainId } from '../../../constants.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.js';
import pools from '../../../data/base/aerodromeStableLpPools.json' with { type: 'json' };

export const getAerodromeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};
