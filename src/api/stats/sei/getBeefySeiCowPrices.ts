import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowSeiPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('sei', tokenPrices);
};
