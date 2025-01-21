import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowAvaxPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('avax', tokenPrices);
};
