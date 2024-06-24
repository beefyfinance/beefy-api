import { getCowApy } from '../common/getCowVaultApys';

export const getBeefyZkSyncCowApys = async () => {
  return await getCowApy('zksync');
};
