import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowMegaethPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('megaeth', tokenPrices);
};
