import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowRobinhoodPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('robinhood', tokenPrices);
};
