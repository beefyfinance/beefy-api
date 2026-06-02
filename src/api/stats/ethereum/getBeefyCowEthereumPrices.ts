import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowEthereumPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('ethereum', tokenPrices);
};
