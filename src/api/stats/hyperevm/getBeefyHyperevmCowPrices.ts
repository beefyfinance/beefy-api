import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowHyperevmPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('hyperevm', tokenPrices);
};
