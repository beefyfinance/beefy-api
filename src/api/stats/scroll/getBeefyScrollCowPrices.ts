import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowScrollPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('scroll', tokenPrices);
};
