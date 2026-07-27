import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowMonadPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('monad', tokenPrices);
};
