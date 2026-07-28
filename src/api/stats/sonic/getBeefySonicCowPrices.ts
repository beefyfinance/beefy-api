import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowSonicPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('sonic', tokenPrices);
};
