import { AVAX_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import { getGmxPrices } from '../common/gmx/getGmxPrices.ts';
import pools from '../../../data/avax/gmxPools.json' with { type: 'json' };

export const getGmxAvalanchePrices = async (tokenPrices: PricesById) => {
  return await getGmxPrices(chainId, pools, tokenPrices);
};
