import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowMantlePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('mantle', tokenPrices);
};
