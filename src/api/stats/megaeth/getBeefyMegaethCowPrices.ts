import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowMegaethPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('megaeth', tokenPrices);
};
