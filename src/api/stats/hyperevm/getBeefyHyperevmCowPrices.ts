import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowHyperevmPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('hyperevm', tokenPrices);
};
