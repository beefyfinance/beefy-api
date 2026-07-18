import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowMantlePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('mantle', tokenPrices);
};
