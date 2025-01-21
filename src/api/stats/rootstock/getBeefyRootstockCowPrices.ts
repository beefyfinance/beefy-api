import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowRootstockPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('rootstock', tokenPrices);
};
