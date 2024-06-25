import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowPolyPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('polygon', tokenPrices);
};
