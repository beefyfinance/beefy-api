import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowLiskPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('lisk', tokenPrices);
};
