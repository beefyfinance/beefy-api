import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import { getGmxPrices } from '../common/gmx/getGmxPrices.ts';
import pools from '../../../data/arbitrum/gmxPools.json' with { type: 'json' };

export const getGmxArbitrumPrices = async (tokenPrices: PricesById) => {
  return await getGmxPrices(ApiChainId.arbitrum, pools, tokenPrices);
};
