import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';

export const getBeefyCowRobinhoodPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices('robinhood', tokenPrices);
};
