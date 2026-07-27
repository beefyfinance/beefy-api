import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowOPPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('optimism', tokenPrices);
};
