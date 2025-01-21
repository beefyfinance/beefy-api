import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowModePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('mode', tokenPrices);
};
