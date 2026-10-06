import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import { getGmxPrices } from '../common/gmx/getGmxPrices.ts';
import pools from '../../../data/avax/gmxPools.json' with { type: 'json' };

export const getGmxAvalanchePrices = async (tokenPrices: PricesById) => {
  return await getGmxPrices(ApiChainId.avax, pools, tokenPrices);
};
