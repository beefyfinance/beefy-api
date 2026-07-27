import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowScrollPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('scroll', tokenPrices);
};
