import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowBasePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('base', tokenPrices);
};
