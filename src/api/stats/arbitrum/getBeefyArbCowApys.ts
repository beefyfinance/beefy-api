import { getCowApy } from '../common/getCowVaultApys';

export const getBeefyArbCowApys = async () => {
  return await getCowApy('arbitrum');
};
