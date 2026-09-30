import type { PricesById } from '../../../types/prices.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.ts';
import pools from '../../../data/lisk/velodromeLiskStablePools.json' with { type: 'json' };

const getVelodromeLiskStablePrices = async (tokenPrices: PricesById) => {
  return await getSolidlyStablePrices(ApiChainId.lisk, pools, tokenPrices);
};

export default getVelodromeLiskStablePrices;
