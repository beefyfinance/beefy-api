import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowModeApys = async () => {
  return await getCowApys('mode');
};
