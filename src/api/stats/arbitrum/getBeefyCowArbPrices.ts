import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowArbPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('arbitrum', tokenPrices);
};
