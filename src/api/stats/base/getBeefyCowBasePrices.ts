import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowBasePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('base', tokenPrices);
};
