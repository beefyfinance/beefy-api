import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowRootstockPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('rootstock', tokenPrices);
};
