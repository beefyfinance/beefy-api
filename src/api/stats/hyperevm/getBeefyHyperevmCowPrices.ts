import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowHyperevmPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('hyperevm', tokenPrices);
};
