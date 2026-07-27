import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyBaseCowApys = async () => {
  return await getCowApys('base');
};
