import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowLineaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('linea', tokenPrices);
};
