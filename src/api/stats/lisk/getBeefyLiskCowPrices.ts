import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowLiskPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('lisk', tokenPrices);
};
