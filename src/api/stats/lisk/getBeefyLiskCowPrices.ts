import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowLiskPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('lisk', tokenPrices);
};
