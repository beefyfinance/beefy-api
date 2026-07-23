import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyCowEthereumApys = async () => {
  return await getCowApys('ethereum');
};
