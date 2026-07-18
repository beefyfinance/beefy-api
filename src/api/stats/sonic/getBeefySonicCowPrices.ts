import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowSonicPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('sonic', tokenPrices);
};
