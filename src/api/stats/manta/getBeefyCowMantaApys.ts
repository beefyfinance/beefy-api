import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowMantaApys = async () => {
  return await getCowApys('manta');
};
