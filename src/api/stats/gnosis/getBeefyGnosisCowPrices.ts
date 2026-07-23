import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowGnosisPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('gnosis', tokenPrices);
};
