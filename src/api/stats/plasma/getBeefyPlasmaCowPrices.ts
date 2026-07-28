import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowPlasmaPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('plasma', tokenPrices);
};
