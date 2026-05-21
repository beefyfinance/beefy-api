import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowEthereumApys = async () => {
  return await getCowApys('ethereum');
};
