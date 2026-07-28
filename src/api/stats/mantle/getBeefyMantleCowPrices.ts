import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowMantlePrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('mantle', tokenPrices);
};
