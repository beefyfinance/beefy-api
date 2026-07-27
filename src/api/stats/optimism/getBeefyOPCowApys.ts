import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyOPCowApys = async () => {
  return await getCowApys('optimism');
};
