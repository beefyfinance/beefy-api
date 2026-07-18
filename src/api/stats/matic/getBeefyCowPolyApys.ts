import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyCowPolyApys = async () => {
  return await getCowApys('polygon');
};
