import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowMantleApys = async () => {
  return await getCowApys('mantle');
};
