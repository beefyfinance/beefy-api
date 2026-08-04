import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowLineaPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('linea', tokenPrices);
};
