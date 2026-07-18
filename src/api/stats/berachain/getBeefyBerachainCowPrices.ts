import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowBerachainPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('berachain', tokenPrices);
};
