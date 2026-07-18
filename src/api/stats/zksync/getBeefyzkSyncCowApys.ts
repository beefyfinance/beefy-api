import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyzkSyncCowApys = async () => {
  return await getCowApys('zksync');
};
