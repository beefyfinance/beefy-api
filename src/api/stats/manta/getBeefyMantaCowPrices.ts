import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowMantaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('manta', tokenPrices);
};
