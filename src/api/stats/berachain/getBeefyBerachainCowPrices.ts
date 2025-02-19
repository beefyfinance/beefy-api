import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowBerachainPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('berachain', tokenPrices);
};
