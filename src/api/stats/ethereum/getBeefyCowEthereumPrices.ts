import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowEthereumPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('ethereum', tokenPrices);
};
