import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowArbPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('arbitrum', tokenPrices);
};
