import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowBscPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('bsc', tokenPrices);
};
