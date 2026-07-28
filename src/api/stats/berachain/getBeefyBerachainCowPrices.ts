import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowBerachainPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('berachain', tokenPrices);
};
