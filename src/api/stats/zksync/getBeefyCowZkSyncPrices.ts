import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowZkSyncPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('zksync', tokenPrices);
};
