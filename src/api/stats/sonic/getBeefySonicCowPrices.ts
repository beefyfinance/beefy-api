import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowSonicPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('sonic', tokenPrices);
};
