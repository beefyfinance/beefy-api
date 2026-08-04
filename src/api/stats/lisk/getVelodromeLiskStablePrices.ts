import { LISK_CHAIN_ID } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getSolidlyStablePrices from '../common/getSolidlyStablePrices.ts';
import pools from '../../../data/lisk/velodromeLiskStablePools.json' with { type: 'json' };

const getVelodromeLiskStablePrices = async (tokenPrices: PricesById) => {
  return await getSolidlyStablePrices(LISK_CHAIN_ID, pools, tokenPrices);
};

export default getVelodromeLiskStablePrices;
