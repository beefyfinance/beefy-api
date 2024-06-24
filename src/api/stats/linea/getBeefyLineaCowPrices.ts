import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowLineaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('linea', tokenPrices);
};
