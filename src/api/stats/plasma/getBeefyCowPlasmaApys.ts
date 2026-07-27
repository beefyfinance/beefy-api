import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyCowPlasmaApys = async () => {
  return await getCowApys('plasma');
};
