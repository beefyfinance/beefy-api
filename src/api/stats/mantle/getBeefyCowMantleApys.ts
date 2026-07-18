import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyCowMantleApys = async () => {
  return await getCowApys('mantle');
};
