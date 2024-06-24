import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyzkSyncCowApys = async () => {
  return await getCowApys('zksync');
};
