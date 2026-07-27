import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowPlasmaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('plasma', tokenPrices);
};
