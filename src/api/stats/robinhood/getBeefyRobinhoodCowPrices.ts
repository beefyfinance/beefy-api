import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices.ts';

export const getBeefyCowRobinhoodPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('robinhood', tokenPrices);
};
