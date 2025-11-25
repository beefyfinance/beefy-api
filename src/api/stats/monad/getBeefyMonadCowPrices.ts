import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowMonadPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('monad', tokenPrices);
};
