import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyEthereumCowApys = async () => {
  return await getCowApys('ethereum');
};
