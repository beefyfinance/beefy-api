import type { PricesById } from '../../../types/prices.ts';
import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowGnosisPrices = async (tokenPrices: PricesById) => {
  return await getBeefyCowcentratedVaultPrices('gnosis', tokenPrices);
};
