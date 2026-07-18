import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowEthereumPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('ethereum', tokenPrices);
};
