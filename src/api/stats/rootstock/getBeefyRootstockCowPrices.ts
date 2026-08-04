import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowRootstockPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('rootstock', tokenPrices);
};
