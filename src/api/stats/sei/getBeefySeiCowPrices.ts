import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowSeiPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('sei', tokenPrices);
};
