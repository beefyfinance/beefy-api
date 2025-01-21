import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowScrollPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('scroll', tokenPrices);
};
