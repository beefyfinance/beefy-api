import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowAvaxPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('avax', tokenPrices);
};
