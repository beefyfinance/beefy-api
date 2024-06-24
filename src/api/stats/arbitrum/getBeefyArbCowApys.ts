import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyArbCowApys = async () => {
  return await getCowApys('arbitrum');
};
