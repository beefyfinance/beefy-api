import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowZkSyncPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('zksync', tokenPrices);
};
