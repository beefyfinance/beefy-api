import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowRootstockApys = async () => {
  return await getCowApys('rootstock');
};
