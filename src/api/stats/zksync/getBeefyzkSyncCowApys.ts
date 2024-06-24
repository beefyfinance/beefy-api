import { getCowApy } from '../common/getCowVaultApys';

export const getBeefyzkSyncCowApys = async () => {
  return await getCowApy('zksync');
};
