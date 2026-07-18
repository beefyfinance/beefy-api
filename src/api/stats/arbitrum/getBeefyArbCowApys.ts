import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyArbCowApys = async () => {
  return await getCowApys('arbitrum');
};
