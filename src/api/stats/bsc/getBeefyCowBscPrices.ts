import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowBscPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('bsc', tokenPrices);
};
