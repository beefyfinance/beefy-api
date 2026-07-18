import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowZkSyncPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('zksync', tokenPrices);
};
