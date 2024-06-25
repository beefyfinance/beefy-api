import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowOPPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('optimism', tokenPrices);
};
