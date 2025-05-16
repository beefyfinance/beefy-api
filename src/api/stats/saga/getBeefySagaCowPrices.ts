import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowSagaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('saga', tokenPrices);
};
