import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowMonadPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('monad', tokenPrices);
};
