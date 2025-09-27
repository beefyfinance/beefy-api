import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowPlasmaApys = async () => {
  return await getCowApys('plasma');
};
