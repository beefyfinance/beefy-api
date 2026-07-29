import { BASE_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.ts';
import pools from '../../../data/base/aerodromeStableLpPools.json' with { type: 'json' };

export const getAerodromeStablePrices = async (tokenPrices: PricesById) => {
  return await getSolidlyStablePrices(chainId, pools, tokenPrices);
};
