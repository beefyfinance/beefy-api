import { getCowApy } from '../common/getCowVaultApys';

export const getBeefyOPCowApys = async () => {
  return await getCowApy('optimism');
};
