import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowMoonbeamPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('moonbeam', tokenPrices);
};
