import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyOPCowApys = async () => {
  return await getCowApys('optimism');
};
