import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowBscPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('bsc', tokenPrices);
};
