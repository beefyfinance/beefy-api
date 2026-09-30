import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.ts';
import pools from '../../../data/base/aerodromeStableLpPools.json' with { type: 'json' };

export const getAerodromeStablePrices = async (tokenPrices: PricesById) => {
  return await getSolidlyStablePrices(ApiChainId.base, pools, tokenPrices);
};
