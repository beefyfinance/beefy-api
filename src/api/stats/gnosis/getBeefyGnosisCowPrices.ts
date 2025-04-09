import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowGnosisPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('gnosis', tokenPrices);
};
