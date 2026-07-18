import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowAvaxPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('avax', tokenPrices);
};
