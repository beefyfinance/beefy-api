import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowPlasmaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('plasma', tokenPrices);
};
