import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowPolyPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('polygon', tokenPrices);
};
