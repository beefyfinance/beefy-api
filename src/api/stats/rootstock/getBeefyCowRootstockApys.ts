import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyCowRootstockApys = async () => {
  return await getCowApys('rootstock');
};
