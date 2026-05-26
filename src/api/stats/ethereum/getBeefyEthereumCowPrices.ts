import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyEthereumCowPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('ethereum', tokenPrices);
};
