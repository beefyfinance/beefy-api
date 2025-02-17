import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowUnichainPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('unichain', tokenPrices);
};
